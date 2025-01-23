import { useState, useEffect } from "react";
import { Configuration, OpenAIApi } from "openai";
import * as XLSX from 'xlsx';
import { uid } from 'uid';
import './css/Header.css'
import Logo from "./assets/logo.png";

function App() {  
  const [data, setData] = useState([]);

  window.onload = ()=>{document.getElementById('random').checked='checked'};

  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);
  console.log("open ai config: ",openai)


  //handle radio button 
  //hide and unhide panels
  const handleRadio = () =>{
    var selected_value = document.getElementsByName("set-type")
    //console.log("selected_value: ", selected_value)
    if(selected_value[0].checked){
      console.log("the radio: ",selected_value[0].value)
      document.getElementById('pnl_ques_option').style.display="block";
      document.getElementById('pnl_ques_generate').style.display="none";
      document.getElementById('pnl_bulk').style.display="none";
      
    } else if(selected_value[1].checked){
      console.log("the radio: ",selected_value[1].value)
      document.getElementById('pnl_ques_option').style.display="block";
      document.getElementById('pnl_ques_generate').style.display="block";
      document.getElementById('pnl_bulk').style.display="none";

    } else if(selected_value[2].checked){
      console.log("the radio: ",selected_value[2].value)
      document.getElementById('pnl_ques_option').style.display="none";
      document.getElementById('pnl_ques_generate').style.display="none";
      document.getElementById('pnl_bulk').style.display="block";
    } 
    document.getElementById('subject').value="";
    document.getElementById('ques-type').value="";
    document.getElementById('number').value="";
  };

  //handle openai call for the prompts
  const handleClick = async () => {
    document.getElementById("overlay-loading").style.display='block';

    var final_prompt = '';

    var article = "Good day everyone. Today, before revealing our topic, let's address $1,000,000 question. How do we communicate effectively? For example, if I instructed you to fold a paper in half, then unfold it and fold it into thirds, would you understand? Or if I said to press the red button twice? But only after pressing the green button could you follow that these instructions might seem confusing, right? Right. Now let's dive into the world of customer service. Imagine you're ready to take a new call feeling happy and settled. The cooler, however, is furious because their order was delayed and our. Isn't working. The customer is extremely disappointed and angry. What should you do in this situation? Should you panic? Put yourself on mute and frantically think of something to say? Or should you repeatedly apologize, saying sorry over and over? Neither of these approaches is likely to help. Instead, let's consider. A better approach? You might say I understand you're calling because the service isn't working. Let me check into this. I think it could be a specific issue, so I will contact the relevant team and escalate the matter. We will keep you posted or you can call us back in 24 hours, however. This is a. Lot of information all at once did the customer understand? And probably not, since the conversation was more of a monologue lacking interaction. This brings us to. The core of our discussion, the 3 seas of communication, these are clarity, conciseness, and consistency. Let's break them down. Clarity. This ensures that your message is. Easily understood when giving instructions or information, present all necessary details in a logical order. Make sure what comes first, second and so on is clear and straightforward. Conciseness. This means keeping your method short and simple. Use straightforward sentences and get straight to the point. Avoid unnecessary elaboration as long winded explanations can confuse the customer and waste their time. Short clear instructions make communication more effective. And show respect for the customers time. Consistency. This involves maintaining uniformity in your communication regardless of the customer 's mood or tone consistency in your messaging and approach helps build trust and reliability. It's about applying the free fees consistently in every interaction, not just sporadically. To practice these techniques regularly, follow these tips. Use simple. And straightforward language, but remain polite. Structure your messages logically for clarity, avoid confusing acronyms and jargon, provide accurate information. Practice active listening to ensure understanding and clarity. Unclear communication can lead to misunderstandings, conflicts, decreased productivity and dissatisfied customers. In summary, think of clarity like a GPF. It must provide clear, precise directions. Conciseness is like short and to the point. Consistency is like brushing your teeth. A regular habit that shouldn't change day to day. Thank you for your attention. I look forward to our next topic. See you then."

    var transscript_prompt="Create @num @type questions based on the key points from the following text about effective communication in customer service. Each question should have one correct answer and three incorrect options. Label each as 'Question' without numbering them. After each question, provide the correct answer. text: @script. keep all the text simple no style."
    //var prompt = "Create @num @type questions focused on @subject in English grammar. Each question should have one correct answer and three incorrect options. Label each as 'Question' without numbering them. After each question, provide the correct answer."
    var prompt = "Create @num @type questions focused on @subject in English grammar. Each question should have one correct answer and three incorrect options. Label each question as 'Question' without number them and answer as 'Answer'. After each question, provide the correct answer. keep all the text simple no style."

    var subject = document.getElementById("subject").value;
    var type = document.getElementById("ques-type").value;
    var no_ques = document.getElementById("number").value;

    //console.log("subject, type, no_ques: ", subject, type, no_ques);

    if(subject == "transcript"){
      final_prompt = transscript_prompt.replace("@script", article)
    }else{
      final_prompt = prompt.replace("@subject", subject)
    }

    final_prompt = final_prompt.replace("@num", no_ques);

    if(type == "fill"){
      final_prompt = final_prompt.replace("@type", "of fill-in-the-blank")
    }else if(type == "multi"){
      final_prompt = final_prompt.replace("@type", "of multiple-choice")
    }else{
      final_prompt = final_prompt.replace("@type", "must have both multiple-choice types and fill-in-the-blanks types")
    }
    

    //console.log("the final prompt: ", final_prompt)

    //openai call
    try {
      console.log("calling openai");
      const response = await openai.createChatCompletion({
        model: 'gpt-4o-mini', 
        messages: [{"role": "user", "content": final_prompt}]
      });
      //document.getElementById("result").value = response.data.choices[0].message.content;
      var selected_value = document.getElementsByName("set-type");
      if(selected_value[0].checked){
        document.getElementById('txb_disp').value = response.data.choices[0].message.content;
        document.getElementById("overlay-loading").style.display='none';
        document.getElementById('overlay').style.display = 'block';
      }else{
        loadSelection(response.data.choices[0].message.content);
      }      
    } catch (error) {
      console.error("The error for calling openai is: ",error);
    }  

    document.getElementById("overlay-loading").style.display='none';
  };

  function resizeTextArea(side){
    //console.log("working")
    //document.querySelectorAll("textarea").forEach(function(textarea) {
    document.getElementsByName("tarea_selection").forEach(function(textarea) {
      textarea.style.width = '100%';
      
      textarea.style.height = side=='right'? (textarea.scrollHeight+10) + "px" :textarea.scrollHeight + "px";

      textarea.style.overflow = "hidden";
      
      textarea.addEventListener("input", function() {
        this.style.height = "auto";
        //console.log("this.scrollHeight: ",this.scrollHeight)
        this.style.height = this.scrollHeight + "px";
      });
    });
  }

  const loadSelection = (value) => {
    //console.log("The list of questions are: ",value);
    var question = value.split("Question:").slice(1)
    //console.log(question)
    document.getElementById("pnl_sel_left").innerHTML="";
    question.forEach(element => {
      var uniq = uid();
      //console.log(element.trim())
      document.getElementById("pnl_sel_left").innerHTML += "<div id='box_"+uniq+"'>"+
                    "<input id='cb_"+uniq+"' type='checkbox' name='left_selection' value='"+uniq+"' onclick='handleSelect(`"+uniq+"`)' hidden/>"+
                    "<textarea for='cb_"+uniq+"' id='lbl_"+uniq+"' onclick='handleTAClick(`"+uniq+"`)' name='tarea_selection' style='display: block; outline: none; resize: none; padding: 0px 5px; cursor: pointer;' readonly>"+
                    element.trim()+
                    "</textarea>"+
                  "</div>";
      resizeTextArea('left');
    });
  };

  document.getElementsByName('left_selection').onClick=(e)=>{
    console.log('event', e);
  };

  useEffect(()=>{
    //alert('working');
    const script = document.createElement('script');
    script.type="text/javascript"
    script.src="/lib/selection.js"
    //script.text = `function handleSelect(){ alert("it is working.") }`;
    document.body.appendChild(script);
  },[]);

  //handle bulk upload
  //populate excel data on choosing file
  const handleUpload = (event) => {
    document.getElementById("overlay-loading").style.display='block';
    
    //console.log("file name: ", event.target.files[0].name);
    document.getElementById("disp_file_name").textContent = event.target.files[0].name
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setData(jsonData);
    };

    reader.readAsArrayBuffer(file);
    document.getElementById("overlay-loading").style.display='none';
  };

  const handleDowoloadFile = () => {
    window.open('https://dxcportal-my.sharepoint.com/personal/abhinash_dora_dxc_com/Documents/Upload%20Question%20Templet.xlsx')
  };

  const handleMoveRightClick = () => {
    var slected = document.getElementsByName("left_selection")
    console.log(slected);
    var list_checked = []

    slected.forEach(element => {
      if(element.checked){
        console.log(element.id)
        list_checked.push(element)
      }      
    });

    list_checked.forEach(element => {
      var inner_context = document.getElementById("lbl_"+element.value).textContent;
      //console.log("inner text: ", inner_context)

      document.getElementById('pnl_sel_right').innerHTML+="<div id='rbox_"+element.value+"' style='border: 3px solid #fff; background_color: #5F249F; borderradius: 5px;'>"+
          "<div style='position: relative;'><button onClick={handleRemoveClick(`"+element.value+"`)} style='position: absolute; background-color: #5F249F; border: solid 2px #fff; border-radius: 50%; font-size: xx-small; color: #fff;font-weight: 900; right: 0;'>&nbsp; X &nbsp;</button></div>"+
          "<textarea name='tarea_selection' style='display: block; outline: none; resize: none; padding: 0px 5px; border:2px solid #5F249F;' for='cb_"+element.value+"' id='lbl_"+element.value+"' onclick='handleTAClick(`"+element.value+"`)' readonly>"+
          inner_context+
            "</textarea>"+
        "</div>";
      document.getElementById("box_"+element.value).remove();
      resizeTextArea('right');
    });
    
  };

  const handleSaveClick = () => {
    handleClick();
  };

  const handleXClick = () => {
    document.getElementById('overlay').style.display = 'none';
  };

  return (
    <main className="main">
      <div className="App">
        <div className="header">
          <div className="logo">Question Generation</div>
          <div className="user-info">
            { <img src={Logo} alt="Decorative background" className="header-right-image" /> }
          </div>
        </div>
      </div>
      <div id='overlay' class='overlay' hidden>
        <div className="overlay_main">
          <div><button onClick={handleXClick} className="btn_overlay">&nbsp; X &nbsp;</button></div>
          <div><textarea id='txb_disp' className="txb_disp"></textarea></div>
        </div>        
      </div>
      <div id='overlay-loading' class='overlay' hidden>
        <div className="overlay_main">
        <div class="loader-container">
          <div class="loader">
            <div class="inner-circle"></div>
          </div>
        </div>
        </div>        
      </div>
      <div className="main-container">
        <div className="main-content">
          <div className="radio-container">
            <span className="radio-span">
              <input className="radio" type="radio" name="set-type" id="random" onClick={handleRadio}/><label for="random">Create Ramdom Question Set</label> 
            </span>
            <span className="radio-span">
              <input className="radio" type="radio" name="set-type" id="selected" onClick={handleRadio}/><label for="selected">Create Selected Question Set</label>
            </span>
            <span className="radio-span">
              <input className="radio" type="radio" name="set-type" id="bulk" onClick={handleRadio}/><label for="bulk">Upload Question from Templet</label>
            </span>
          </div>
          <div id="pnl_ques_option">
            <span class="drop-down-span">
              <select class="drop-down" id="subject">
                <option value="" selected disabled hidden>Choose Subject</option>
                <option value="definite and indefinite articles">Article</option>
                <option value="nouns">Noun</option>
                <option value="verbs">Verb</option>
                <option value="transcript">Effective communication</option>
                {/* <option value="transcript">Transcript</option> */}
              </select>
            </span>
            <span class="drop-down-span">
              <select class="drop-down" id="ques-type">
                <option value="" selected disabled hidden>Choose type of question</option>
                <option value="fill">fill in the blanks</option>
                <option value="multi">multiple chioce</option>
                {/* <option value="both">Both</option> */}
              </select>
            </span>
            <span class="drop-down-span">
              <select class="drop-down" id="number">
                <option value="" selected disabled hidden>Choose no of question</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </span>
          </div>
          <div id="pnl_ques_generate" hidden>
            <div>
              <button onClick={handleClick} className="btn"> Generate </button>
            </div>
            <div className="pnl_sel_main">
              <div>
                <p>Please select the questions from left section to create the test.</p>
              </div>
              <div>
                <div id="pnl_sel_left" className="pnl_sel_left"></div>
                <div className="pnl_sel_middle"><button className="btn_middle" onClick={handleMoveRightClick}>&gt;&gt;</button></div>
                <div id="pnl_sel_right" className="pnl_sel_right"></div>
              </div>            
            </div>
          </div>
          <div id="pnl_bulk" hidden>
            <div>
              <span><a href="https://dxcportal-my.sharepoint.com/personal/abhinash_dora_dxc_com/Documents/Upload%20Question%20Templet.xlsx"><button className="btn_bulk">Download Templet</button></a></span>
              <span className="btn_bulk"><input type="file" id="excel_file" onChange={handleUpload} accept=".xls,.xlsx" hidden/><label for="excel_file">Choose file</label></span>
              <span><label id="disp_file_name" className="disp_file_name">No file chosen.</label></span>
            </div>
            <div class="pnl_excel_data">
            <table class="tbl_excel_data">
              <thead>
                <tr>
                  {data[0] && data[0].map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div> 
        </div>
        <div>
          <button onClick={handleSaveClick} className="btn">Save Test</button>
        </div>      
      </div>      
    </main>
  );
}

export default App;
