const insert = (content) => {
	//find calmly input editor section
	const elements = document.getElementsByClassName("droid");
	if(elements.length === 0){
		return;
	}

	const element = elements[0];

    //grab the first p tag so we can replace it with our injection
    const pToRemove = element.childNodes[0]
    pToRemove.remove();

    //split content by new line
    const splitContent = content.split("\n");

    // wrap in p tags
    splitContent.forEach((content) => {
		const p = document.createElement("p");
		
		if(content === ""){
			const br = document.createElement("br");
			p.appendChild(br);
		} else {
			p.textContent = content;
		}
		//insert into HTML one at a time
		element.appendChild(p);
	})	

}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if(request.message === "inject"){
		const { content } = request;
		
		const result = insert(content);
		
		if(!result){
			sendResponse({ status: "failed" });
		}
		
		sendResponse({ status: "success" });
		
	}
});