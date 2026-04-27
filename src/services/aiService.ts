import { GoogleGenAI } from "@google/genai";
import { Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeLead(lead: Lead) {
  try {
    const prompt = `
      You are a senior sales strategy AI. Analyze the following lead and suggest 3 concrete next steps to move it to the next stage.
      
      Lead: ${lead.firstName} ${lead.lastName}
      Company: ${lead.company}
      Current Status: ${lead.status}
      Notes: ${lead.notes || 'None'}
      
      Keep the focus on high-impact actions. Output as a clear, concise bulleted list in markdown format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Analysis error:", error);
    return "Could not generate AI insights at this time.";
  }
}

export async function draftFollowUp(lead: Lead) {
  try {
    const prompt = `
      Write a professional, personalized follow-up email draft for this lead:
      Name: ${lead.firstName} ${lead.lastName}
      Company: ${lead.company}
      Context: ${lead.notes || 'Recent inquiry'}
      
      Style: Professional but friendly. Focus on providing value.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Draft error:", error);
    return "Could not draft email at this time.";
  }
}
