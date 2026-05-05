import { GoogleGenAI, Type } from '@google/genai';
import type { UserProfile, FoodItem, DietPlan } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeFoodImage(base64Data: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
       role: 'user', 
       parts: [
         { text: 'Analyze this food image. Identify the main dish or ingredients, and estimate the calories and macronutrients (in grams) for a standard portion shown. Reply in Portuguese.' },
         { inlineData: { data: base64Data, mimeType } }
       ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Nome do alimento (ex: Frango grelhado com arroz)" },
          calories: { type: Type.NUMBER, description: "Estimativa de calorias (kcal)" },
          carbs: { type: Type.NUMBER, description: "Carboidratos em gramas" },
          protein: { type: Type.NUMBER, description: "Proteínas em gramas" },
          fat: { type: Type.NUMBER, description: "Gorduras em gramas" }
        },
        required: ["name", "calories", "carbs", "protein", "fat"]
      }
    }
  });

  const text = response.text?.trim();
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text);
}

export async function generateDietPlan(profile: UserProfile, history: FoodItem[]) {
  const historyText = history.length > 0 
    ? `Alimentos frequentemente consumidos: ${history.map(h => h.name).join(', ')}.`
    : '';

  let goalText = profile.goal;
  if (profile.goal === 'ganho_massa') goalText = 'Ganho de Massa Muscular';
  if (profile.goal === 'perda_peso') goalText = 'Perda de Peso';
  if (profile.goal === 'hipertrofia') goalText = 'Hipertrofia Muscular';

  const prompt = `Crie um cardápio semanal sugerido (7 dias) com base no objetivo de ${goalText}.
A pessoa pesa ${profile.weight}kg, tem ${profile.height}cm e almeja consumir cerca de ${profile.targetCalories.toFixed(0)} kcal por dia.
${historyText}
Adapte a dieta incluindo opções saudáveis, mas mantenha a meta calórica e macros alinhados ao objetivo. 
Forneça sugestões detalhadas. Responda estritamente em JSON usando o schema definido.`;

  const response = await ai.models.generateContent({
     model: 'gemini-2.5-flash',
     contents: prompt,
     config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.OBJECT,
           properties: {
              days: {
                 type: Type.ARRAY,
                 items: {
                    type: Type.OBJECT,
                    properties: {
                       day: { type: Type.STRING, description: "Nome do dia (Ex: Segunda-feira)" },
                       meals: {
                          type: Type.ARRAY,
                          items: {
                             type: Type.OBJECT,
                             properties: {
                                type: { type: Type.STRING, description: "Tipo de refeição (Ex: Café da Manhã, Almoço, Jantar)" },
                                suggestions: { 
                                  type: Type.ARRAY, 
                                  items: { type: Type.STRING },
                                  description: "Lista de ingredientes ou pratos sugeridos."
                                }
                             },
                             required: ["type", "suggestions"]
                          }
                       }
                    },
                    required: ["day", "meals"]
                 }
              }
           },
           required: ["days"]
        }
     }
  });

  const text = response.text?.trim();
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as DietPlan;
}

export async function chatWithCoach(
  message: string, 
  profile: UserProfile, 
  previousMessages: {role: string, text: string}[],
  onAction?: (action: 'generate_diet' | 'generate_workout') => void
) {
  const contents: any[] = [];

  // Adiciona histórico
  previousMessages.forEach(m => {
    contents.push({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    });
  });

  contents.push({ role: 'user', parts: [{ text: message }] });

  const tools: any = [{
    functionDeclarations: [
      {
        name: 'trigger_diet_generation',
        description: 'Gera um cardápio e salva no perfil do usuário. CHAME esta função sempre que o usuário pedir um cardápio ou dieta.',
      },
      {
        name: 'trigger_workout_generation',
        description: 'Gera um treino e salva no perfil do usuário. CHAME esta função sempre que o usuário pedir um treino ou plano de exercícios.',
      }
    ]
  }];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      systemInstruction: `Você é a FitVision IA, um coach de fitness e nutricionista amigável. Dê respostas curtas, práticas e motivadoras em português do Brasil. O usuário foca em ${profile.goal}, pesa ${profile.weight}kg, tem ${profile.height}cm e tenta consumir ${Math.round(profile.targetCalories)}kcal/dia. SE O USUÁRIO PEDIR TREINO OU DIETA, USE AS FUNÇÕES (TOOLS) DISPONÍVEIS! NÃO TENTE MONTAR O TREINO OU DIETA EM TEXTO DIRETAMENTE SE AS FUNÇÕES TIVEREM SIDO FORNECIDAS.`,
      tools
    }
  });

  const functionCalls = response.functionCalls;
  if (functionCalls && functionCalls.length > 0) {
    let triggeredDiet = false;
    let triggeredWorkout = false;
    
    for (const call of functionCalls) {
      if (call.name === 'trigger_diet_generation' && onAction) {
        onAction('generate_diet');
        triggeredDiet = true;
      }
      if (call.name === 'trigger_workout_generation' && onAction) {
        onAction('generate_workout');
        triggeredWorkout = true;
      }
    }
    
    if (triggeredDiet && triggeredWorkout) {
      return "Pode deixar comigo! 💪🥗 Seu treino e seu cardápio personalizados estão sendo gerados. Eles estarão disponíveis nas abas secundárias correspondentes em alguns instantes!";
    } else if (triggeredDiet) {
      return "Acabei de colocar a mão na massa! 🥗 O seu cardápio personalizado está sendo gerado e estará disponível na aba **Cardápio IA**.";
    } else if (triggeredWorkout) {
      return "Pode deixar comigo! 💪 Seu treino personalizado está sendo montado e logo estará na aba **Treino IA**.";
    }
  }

  return response.text || "Entendi. Como posso ajudar com seu objetivo hoje?";
}

export async function generateWorkoutPlan(profile: UserProfile) {
  let goalText = profile.goal;
  if (profile.goal === 'ganho_massa') goalText = 'Ganho de Massa Muscular';
  if (profile.goal === 'perda_peso') goalText = 'Perda de Peso';
  if (profile.goal === 'hipertrofia') goalText = 'Hipertrofia Muscular';

  const prompt = `Crie uma rotina de treinos semanal (7 dias) com base no objetivo de ${goalText}.
A pessoa pesa ${profile.weight}kg e tem ${profile.height}cm.
O treino deve ser dividido adequadamente (ex: ABC, Full Body, Upper/Lower, etc).
Para dias de descanso, deixe a lista de exercícios com 1 item descrevendo o tipo de descanso.
Responda estritamente em JSON usando o schema definido.`;

  const response = await ai.models.generateContent({
     model: 'gemini-2.5-flash',
     contents: prompt,
     config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.OBJECT,
           properties: {
              days: {
                 type: Type.ARRAY,
                 items: {
                    type: Type.OBJECT,
                    properties: {
                       day: { type: Type.STRING, description: "Nome do dia (Ex: Segunda-feira)" },
                       focus: { type: Type.STRING, description: "Foco muscular ou atividade (Ex: Peito e Tríceps, ou Descanso Ativo)" },
                       exercises: {
                          type: Type.ARRAY,
                          items: {
                             type: Type.OBJECT,
                             properties: {
                                name: { type: Type.STRING, description: "Nome do exercício" },
                                sets: { type: Type.STRING, description: "Séries (ex: 3, 4)" },
                                reps: { type: Type.STRING, description: "Repetições (ex: 10-12)" },
                                rest: { type: Type.STRING, description: "Descanso (ex: 60s)" }
                             },
                             required: ["name", "sets", "reps"]
                          }
                       }
                    },
                    required: ["day", "focus", "exercises"]
                 }
              }
           },
           required: ["days"]
        }
     }
  });

  const text = response.text?.trim();
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as any;
}
