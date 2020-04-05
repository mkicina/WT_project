//--------------------------------------------------------------------------------------------------------------
//functions for transforming opinion(s) to Html code

function opinion2html(opinion){

    opinion.createdDate=(new Date(opinion.created)).toDateString();
    opinion.willReturnMessage=opinion.willReturn?"I will return to this page.":"Sorry, one visit was enough.";

    const template = document.getElementById("mTmplOneOpinion").innerHTML;
    const htmlWOp = Mustache.render(template,opinion);

    delete(opinion.createdDate);
    delete(opinion.willReturnMessage);

    return htmlWOp;
}

function opinionArray2html(sourceData){

    let htmlWithOpinions="";

    for(const opn of sourceData){
        htmlWithOpinions += opinion2html(opn);
    }

    return htmlWithOpinions;

    //return sourceData.reduce((htmlWithOpinions,opn) => htmlWithOpinions+ opinion2html(opn),"");
}



//--------------------------------------------------------------------------------------------------------------


//data and localStorage handling at startup
let opinions=[];

const opinionsElm=document.getElementById("opinionsContainer");


if(localStorage.myTreesComments){
    opinions=JSON.parse(localStorage.myTreesComments);
}

opinionsElm.innerHTML=opinionArray2html(opinions);
console.log(opinions);

//--------------------------------------------------------------------------------------------------------------
//Form processing functionality

/*
* Note:
* For the sake of simplicity, here we use window.alert to display messages to the user
* However, if possible, avoid them in the production versions of your web applications
*
*/

let myFrmElm=document.getElementById("opnFrm");

myFrmElm.addEventListener
("submit",processOpnFrmData);




function processOpnFrmData(event){
    //1.prevent normal event (form sending) processing
    event.preventDefault();

    //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
    const nopName = document.getElementById("nameElm").value.trim();
    const nopEmail = document.getElementById("emailElm").value.trim();
    const nopUrl = document.getElementById("urlElm").value.trim();

    const nopAgeYoung = document.getElementById("young");
    const nopAgeMiddle = document.getElementById("middle");
    const nopAgeOld = document.getElementById("old");

    const nopHuawei = document.getElementById("phone1");
    const nopHonor = document.getElementById("phone2");
    const nopIPhone = document.getElementById("phone3");

    const nopReason = document.getElementById("reasons");

    const nopReasonOwn = document.getElementById("whyElm").value.trim();

    const nopOpn = document.getElementById("opnElm").value.trim();


    //3. Verify the data
    if(nopName=="" || nopOpn=="" || nopEmail==""){
        window.alert("Please, enter both your name and opinion");
        return;
    }

    var ageState;
    var reasonsArr=[];
    var phoneArr=[];

    if (nopAgeYoung.checked){
        ageState=nopAgeYoung;
    }else if (nopAgeMiddle.checked){
        ageState=nopAgeMiddle;
    }else if (nopAgeOld.checked){
        ageState=nopAgeOld;
    }

    if (nopHuawei.checked){
        phoneArr.push(nopHuawei.value);
    }
    if (nopHonor.checked){
        phoneArr.push(nopHonor.value);
    }
    if (nopIPhone.checked){
        phoneArr.push(nopIPhone.value);
    }

    if (nopReason.id !== "reasons"){
        reasonsArr.push(nopReason.value);
    }else{
        reasonsArr.push(nopReasonOwn);
    }

    //3. Add the data to the array opinions and local storage
    const newOpinion =
        {
            name: nopName,
            email: nopEmail,
            url: nopUrl,
            age: ageState,
            reason: reasonsArr,
            comment: nopOpn,
            phone: phoneArr,
            created: new Date()
        };

    console.log("New opinion:\n "+JSON.stringify(newOpinion));

    opinions.push(newOpinion);

    localStorage.myTreesComments = JSON.stringify(opinions);

    //4. Notify the user
    opinionsElm.innerHTML+=opinion2html(newOpinion);
    window.alert("Your opinion has been stored. Look to the console");
    console.log("New opinion added");
    console.log(opinions);

    //5. Reset the form
    myFrmElm.reset(); //resets the form
}
