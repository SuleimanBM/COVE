
import * as Localization from 'expo-localization';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: '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' });

export const translateText = async (text: string,): Promise<string> => {
  try {
    const targetLanguage = Localization.locale.split('-')[0]; // get user's default language from system settings

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `translate to ${targetLanguage}`
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "llama3-8b-8192",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null
    });

    return chatCompletion.choices[0]?.message.content || text;
  } catch (error) {
    console.error('Error translating text:', error);
    return text;
  }
};

export const detectLanguage = async (text: string): Promise<string> => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Detect the language of the following text and respond with the language code only.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 1,
      max_tokens: 5,
      top_p: 1,
      stream: false,
      stop: null,
    });

    return chatCompletion.choices?.[0]?.message?.content?.trim() || "unknown";
  } catch (error) {
    console.error("Error detecting language:", error);
    return "unknown";
  }
};
