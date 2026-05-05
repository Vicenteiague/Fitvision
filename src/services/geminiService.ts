import { GoogleGenAI, Type } from '@google/genai';
import type { UserProfile, FoodItem, DietPlan } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeFoodImage(base64Data: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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
     model: 'gemini-3.1-pro-preview',
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
