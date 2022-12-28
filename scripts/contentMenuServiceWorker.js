// get key function
const getKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai-key'], (result) => {
      if (result['openai-key']) {
        const decodedKey = atob(result['openai-key']);
        resolve(decodedKey);
      }
    });
  });
};

//send message function
const sendMessage = (content) => {
	chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
		const activeTab = tabs[0].id;
		
		chrome.tabs.sendMessage(
			activeTab,
			{message: "inject", content},
			(response) => {
				if(response.status === "failed"){
					console.log("Injection failed");
				}
			}
		)
	})
}

// function to generate
const generate = async(prompt) => {
	 // Get your API key from storage
     const key = await getKey();
	 const url = 'https://api.openai.com/v1/completions';
	
     // Call completions endpoint
     const completionResponse = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${key}`,
		},
		body: JSON.stringify(
			{
				model: 'text-davinci-003',
				prompt: prompt,
				max_tokens: 1250,
				temperature: 0.7
			}
		),
     });
	 
	 const completion = await completionResponse.json();
	 return completion.choices.pop();
} 

//generate the completion action
const generateCompletionAction = async (info) => {
  try {
	
    sendMessage("Generating...")	
    const { selectionText } = info;
    const basePromptPrefix = `
      Write me a verse for a song with the title below.
			
      Title:
      `;

    const baseCompletion = await generate(
      `${basePromptPrefix}${selectionText}`
    );

    // Add your second prompt here
    const secondPrompt = `
      Take the verse, generate a chorus, a second verse, repeat chorus, a third verse, then repeat chorus.
      
      Title: ${selectionText}
      
      verse: ${baseCompletion.text}
      
      chorus:
      `;

    // Call your second prompt
    const secondPromptCompletion = await generate(secondPrompt);
	sendMessage(secondPromptCompletion.text);
  } catch (error) {
    console.log(error);
	sendMessage(error.toString());
  }
};

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: "context-run",
		title: "Gnerate that next hit",
		contexts: ["selection"]
	})
})
 
chrome.contextMenus.onClicked.addListener(generateCompletionAction);