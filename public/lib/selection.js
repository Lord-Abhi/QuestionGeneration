function handleTAClick(id){
    //alert(id);
    document.getElementById('cb_'+id).click();
}

function handleRemoveClick(id){
    console.log('rbox_'+id)
    document.getElementById('rbox_'+id).remove();
}

function handleSelect(uniqu){
    console.log("uniqe_id: ", uniqu)
    if(document.getElementById('cb_'+uniqu).checked){
        document.getElementById("box_"+uniqu).style.border='2px solid #5F249F';
        document.getElementById("box_"+uniqu).style.marginBottom='5px';
    }else{
        document.getElementById("box_"+uniqu).style.border='2px solid #fff';
    }
    
    // var slected = document.getElementsByName("left_selection")
    // slected.forEach(element => {
    //     if(element.checked){
    //         console.log(element.value);
    //         document.getElementById("box_"+element.value).style.border='3px solid rgb(15 118 110)';
    //     }
    //     else{
    //         document.getElementById("box_"+element.value).style.border='3px solid #fff';
    //     }
    // });
}