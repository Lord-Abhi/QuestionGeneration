import { useState, useEffect } from "react";
import { Configuration, OpenAIApi } from "openai";
import * as XLSX from 'xlsx';
import { uid } from 'uid';
import './css/Header.css'
import Logo from "./assets/logo.png";

function App() {  
  const [data, setData] = useState([]);
  const [isSelectedQuestionSet, setSelectedQuestionSet] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(1);

  window.onload = ()=>{document.getElementById('random').checked='checked'};

  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);
  //console.log("open ai config: ",openai)


  //handle radio button 
  //hide and unhide panels
  const handleRadio = () =>{
    var selected_value = document.getElementsByName("set-type")
    //console.log("selected_value: ", selected_value)
    if(selected_value[0].checked){
      //console.log("the radio: ",selected_value[0].value)
      document.getElementById('pnl_ques_option').style.display="block";
      document.getElementById('pnl_ques_generate').style.display="none";
      document.getElementById('pnl_bulk').style.display="none";      
      document.getElementById('btnPreview').style.display="block";
      document.getElementById('btnPreview2').style.display="none";
      document.getElementById('btnSaveTempley').style.display="none";
      setSelectedQuestionSet(false);
      
    } else if(selected_value[1].checked){
      //console.log("the radio: ",selected_value[1].value)
      document.getElementById('pnl_ques_option').style.display="block";
      document.getElementById('pnl_ques_generate').style.display="block";
      document.getElementById('pnl_bulk').style.display="none";
      document.getElementById('btnPreview').style.display="none";
      document.getElementById('btnPreview2').style.display="block";
      document.getElementById('btnSaveTempley').style.display="none";
      setSelectedQuestionSet(true);

    } else if(selected_value[2].checked){
      //console.log("the radio: ",selected_value[2].value)
      document.getElementById('pnl_ques_option').style.display="none";
      document.getElementById('pnl_ques_generate').style.display="none";
      document.getElementById('pnl_bulk').style.display="block";
      document.getElementById('btnPreview').style.display="none";
      document.getElementById('btnPreview2').style.display="none";
      document.getElementById('btnSaveTempley').style.display="block";
      setSelectedQuestionSet(false);
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
    var prompt = `
you (the AI) help me(the user) to generate a new set of questions each time by strictly following the instructions. 

Instruction for AI
    
1. Generate @num simple multiple-choice questions about @subject in grammar.

2. @restriction

3. Each instructed question type must be in multiple-choice format and provide four answer options:
  -Label each answer as 'Option' with a number in it.
  -One correct option
  -Three incorrect options

4. Label each question as 'Question' @ques_num on them.

5. After each question, provide the correct answer immediately:
  -Label it as 'Correct answer:'.
  -Provide only the text of the correct answer without numbering.

6. Keep all text plain and simple without any formatting, headers, or special styles.`

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
      final_prompt = final_prompt.replace("@type", "fill-in-the-blank")
      final_prompt = final_prompt.replace("@restriction", `The questions must not involve:
          -Creating non fill-in-the-blank-style questions.
          -The question which do not have a blank in it.`)
    }else if(type == "multi"){
      final_prompt = final_prompt.replace("@type", "multiple-choice")
      // final_prompt = final_prompt.replace("@restriction", "Avoid questions that contain '_' characters or fill-in-the-blank-style structures directly or indirectly in questions or quotation, or require users to complete a sentence by filling in missing words.")
      //final_prompt = final_prompt.replace("@restriction", "Please exclude fill-in-the-blank-style questions or missing words or alphabet type questions.");
      final_prompt = final_prompt.replace("@restriction", `The questions must not involve:
          -Creating fill-in-the-blank-style questions.
          -Using blanks in any part of the question.
          -Direct or indirect speech or dialogue.
          -Quoting or citing someone else’s words or text.
          -Titles of shorter works.
          -Highlighting a specific word or phrase.
          -Using a specific example for the question.`)
    }else{
      final_prompt = final_prompt.replace("@type", "must have both multiple-choice types and fill-in-the-blanks types")
    }    

    if(!isSelectedQuestionSet){ 
      final_prompt = final_prompt.replace("@ques_num", `with question number`);
    }else{
      final_prompt = final_prompt.replace("@ques_num", `with no question number`);
    }

    //console.log("the final prompt: ", final_prompt)

    //openai call
    try {
      //console.log("calling openai");
      const response = await openai.createChatCompletion({
        model: 'gpt-4o-mini', 
        messages: [{"role": "system", "content": final_prompt}]
      });
      //document.getElementById("result").value = response.data.choices[0].message.content;
      var selected_value = document.getElementsByName("set-type");
      if(selected_value[0].checked){
        document.getElementById('txb_disp').value = response.data.choices[0].message.content;
        document.getElementById("overlay-loading").style.display='none';
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('disp_overlay').style.display = 'block';
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
      document.getElementById("pnl_sel_left").innerHTML += "<div id='box_"+uniq+"' style='margin-bottom: 5px;'>"+
                    "<input id='cb_"+uniq+"' type='checkbox' name='left_selection' value='"+uniq+"' onclick='handleSelect(`"+uniq+"`)' hidden/>"+
                    "<textarea class='tarea_selection' for='cb_"+uniq+"' id='lbl_"+uniq+"' onclick='handleTAClick(`"+uniq+"`)' name='tarea_selection' style='display: block; margin-bottom:15px; outline: none; resize: none; padding: 0px 5px; cursor: pointer;' readonly>"+
                    "Question: "+element.trim()+
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
      var quesNo = 0;
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log("excel data: ", jsonData);
      jsonData.forEach((data)=>{
        if(data.length>0){
          data[0] = '';
          data[1] = 'Question '+quesNo+': '+data[1];
          data[2] = 'Option 1: '+data[2];
          data[3] = 'Option 2: '+data[3];
          data[4] = 'Option 3: '+data[4];
          data[5] = 'Option 4: '+data[5];
          data[6] = 'Correct Answer: '+data[6];
          console.log(data);  
          quesNo+=1;
        }        
      });
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
    //console.log(slected);
    var list_checked = []

    slected.forEach(element => {
      if(element.checked){
        //console.log(element.id)
        list_checked.push(element)
      }      
    });

    list_checked.forEach(element => {
      var inner_context = document.getElementById("lbl_"+element.value).textContent;
      //console.log("inner text: ", inner_context)

      document.getElementById('pnl_sel_right').innerHTML+="<div id='rbox_"+element.value+"' style='border: 3px solid #fff; background_color: #5F249F; borderradius: 5px;'>"+
          "<div style='position: relative;'><button onClick={handleRemoveClick(`"+element.value+"`)} style='position: absolute; background-color: #5F249F; border: solid 2px #fff; border-radius: 50%; font-size: xx-small; color: #fff;font-weight: 900; right: 0;'>&nbsp; X &nbsp;</button></div>"+
          "<textarea name='tarea_selection' class='tbox_right' style='display: block; outline: none; resize: none; padding: 0px 5px; border:2px solid #5F249F;' for='cb_"+element.value+"' id='lbl_"+element.value+"' onclick='handleTAClick(`"+element.value+"`)' readonly>"+
          inner_context+
            "</textarea>"+
        "</div>";
      document.getElementById("box_"+element.value).remove();
      resizeTextArea('right');
    });
    document.getElementById('pnl_sel_left').querySelectorAll('textarea').forEach((child)=>{
      child.style.height = "144px";
    });
  };

  const handlePreviewClick = () => {
    if(document.getElementById('subject').value){
      if(document.getElementById('ques-type').value){
        if(document.getElementById('number').value){
          handleClick();
        }else{
          alert("Please select number of questions.");
        }
      }else{
        alert("Please select the question type.");
      }
    }else{
      alert("Please select the subject.");
    }
  };

  const handlePreview2Click = () => {
    //console.log("right panel: ", document.getElementById('pnl_sel_right').innerHTML.trim());
    if(document.getElementById('pnl_sel_right').innerHTML.trim()!=""){
      var finalText = '';
      var quesNo = 1;
      //console.log("right panel data: ", document.getElementsByClassName('tbox_right'));
      document.getElementById('txb_disp').value = "";
      document.getElementById('pnl_sel_right').querySelectorAll('textarea').forEach((child)=>{
        //console.log("right panel data: ", child.value);
        finalText += child.value.replace('Question', 'Question '+quesNo)+"\n\n";
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('disp_overlay').style.display = 'block';
        quesNo += 1;
      });
      document.getElementById('txb_disp').value += finalText.trim();
    }else{
      alert("Please move question(s) to the right panel to preview.");
    }
  }

  const handleSaveClick = () => {
    handleSaveTempletClick();
  }

  const handleSaveTempletClick = () => {
    console.log("bulk upload selected: ", document.getElementById('bulk').checked)
    if(document.getElementById('bulk').checked){
      var tbody = document.getElementById("tbl_bulkUpload").getElementsByTagName("tbody")[0]
      console.log(tbody)
      if (tbody.rows.length === 0) {
        alert("Please upload the template to save.");
      } else {
        window.location.href = "http://localhost:3000/";
      }
    }
    window.location.href = "http://localhost:3000/";
  }

  const handleXClick = () => {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('disp_overlay').style.display = 'none';
  };

  const handleClearAllClick = () =>{
    document.getElementById('pnl_sel_right').innerHTML="";    
  };

  const handleSubjectChange = () => {
    if(isSelectedQuestionSet){
      if(document.getElementById('pnl_sel_right').innerHTML.trim()!="")
      {
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('confirm_overlay').style.display = 'block';
      }            
    }
  };

  const handleConfirmAction = (e) =>{
    //console.log(e.target.textContent)
    var current_value = document.getElementById('subject').value;
    console.log("current vlaue: ", current_value);

    if(e.target.textContent.trim() == "Yes"){
      document.getElementById('pnl_sel_left').innerHTML="";
      document.getElementById('pnl_sel_right').innerHTML="";
    }else{
      document.getElementById('subject').selectedIndex = selectedIndex;
      document.getElementById('pnl_sel_left').innerHTML="";
      document.getElementById('subject').value = current_value;
    }
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('confirm_overlay').style.display = 'none';
    console.log("dropdown value: ",document.getElementById('subject').value);    
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
        <div id='disp_overlay' className="overlay_main" hidden>
          <div><button onClick={handleXClick} className="btn_overlay">&nbsp; X &nbsp;</button></div>
          <div><textarea id='txb_disp' className="txb_disp"></textarea></div>
          <div><button onClick={handleSaveClick} className="btn">Save Test</button></div>
        </div>   
        <div id='confirm_overlay' class="confirm-box" hidden>
          <p>Do you want to discard the selected question(s)?</p>
          <div class="confirm-btns">
            <button class="yes" onClick={handleConfirmAction}>Yes</button>
            <button class="no" onClick={handleConfirmAction}>No</button>
          </div>
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
              <input className="radio" type="radio" name="set-type" id="random" onClick={handleRadio}/><label for="random">Create Random Questions </label> 
            </span>
            <span className="radio-span" style={{marginLeft: "25px"}}>
              <input className="radio" type="radio" name="set-type" id="selected" onClick={handleRadio}/><label for="selected">Create Customized Questions </label>
            </span>
            <span className="radio-span" style={{marginLeft: "-4px"}}>
              <input className="radio" type="radio" name="set-type" id="bulk" onClick={handleRadio}/><label for="bulk">Bulk Upload Questions</label>
            </span>
          </div>
          <div id="pnl_ques_option" className="pnl_ques_selection">
            <span class="drop-down-span">
              <select class="drop-down" id="subject" onChange={handleSubjectChange}>
                <option value="" selected disabled hidden>Choose subject</option>
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
                <option value="" selected disabled hidden>Choose number of questions</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </span>
          </div>
          <div id="pnl_ques_generate" hidden>
            <div>
              <button onClick={handlePreviewClick} className="btn"> Generate </button>
            </div>
            <div className="pnl_sel_main">
              <div>
                <p>Please select the questions from the left section to create the test.</p>
              </div>
              <div>
                <div id="pnl_sel_left" className="pnl_sel_left"></div>
                <div className="pnl_sel_middle">
                  <div>
                    <button className="btn_middle1" onClick={handleMoveRightClick}>&gt;&gt;</button>
                  </div>
                  <div>
                    <button className="btn_middle2" onClick={handleClearAllClick}>Clear All</button>
                  </div>
                </div>
                <div id="pnl_sel_right" className="pnl_sel_right"></div>
              </div>            
            </div>
          </div>
          <div id="pnl_bulk" hidden>
            <div>
              <span><a href="https://dxcportal-my.sharepoint.com/personal/abhinash_dora_dxc_com/Documents/Documents/Upload%20Question%20Templet.xlsx"><button className="btn_bulk">Download Template</button></a></span>
              <span className="btn_bulk"><input type="file" id="excel_file" onChange={handleUpload} accept=".xls,.xlsx" hidden/><label for="excel_file">Choose file</label></span>
              <span><label id="disp_file_name" className="disp_file_name">No file chosen.</label></span>
            </div>
            <div class="pnl_excel_data" style={{height: "530px", overflow: "auto"}}>
            <table id="tbl_bulkUpload" class="tbl_excel_data" style={{width: "100%"}}>
              <tbody>
                {data.slice(1).map((row, rowIndex) => (
                  <tr className="tblRow" key={rowIndex}>
                     <table style={{marginBottom: "10px"}}>
                      {row.map((cell, cellIndex) => (                      
                        <tr>
                          <td key={cellIndex}>{cell}</td>
                        </tr>                        
                      ))}
                    </table>
                  </tr>
                ))}                
              </tbody>
            </table>
            </div>
          </div> 
        </div>
        <div>
          <button id="btnPreview" onClick={handlePreviewClick} className="btn">Preview</button>
          <button id="btnPreview2" onClick={handlePreview2Click} className="btn" hidden>Preview</button>
          <button id="btnSaveTempley" onClick={handleSaveTempletClick} className="btn" hidden>Save Test</button>
        </div>      
      </div>      
    </main>
  );
}

export default App;
