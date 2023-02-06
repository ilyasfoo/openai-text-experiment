import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const description = req.body.description || '';
  if (description.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid description",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(description),
      temperature: 0.8,
      max_tokens: 100,
    });
    const text = completion.data.choices[0].text;
    const style1start = text.indexOf('Style 1: ');
    const style1end = text.indexOf('Style 2: ');
    const results = [
      text.slice(style1start, style1end).replace('Style 1: ', '').trim(),
      text.slice(style1end).replace('Style 2: ', '').trim(),
    ];
    res.status(200).json({
      result: results,
    });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(description) {
  return `As an expert online marketer, paraphrase the following product description into 2 different styles.
  Style 1: Extremely exciting and engaging
  Style 2: Extremely sarcastic and funny

  Description: ${description}`;
}
