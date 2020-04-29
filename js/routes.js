//an array, defining the routes
export default[

    {
        //the part after '#' in the url (so-called fragment):
        hash:"welcome",
        ///id of the target html element:
        target:"router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate:(targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-welcome").innerHTML

    },

    {
        hash:"articles",
        target:"router-view",
        getTemplate: fetchAndDisplayArticles
    },


    {
        hash:"opinions",
        target:"router-view",
        getTemplate: createHtml4opinions
    },
    {
        hash:"addOpinion",
        target:"router-view",
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-addOpinion").innerHTML
    }
];

function createHtml4Main(targetElm, current,totalCount){

    current=parseInt(current);
    totalCount=parseInt(totalCount);
    const data4rendering={
        currPage:current,
        pageCount:totalCount
    };



    if(current>1){
        data4rendering.prevPage=current-1;
    }

    if(current<totalCount){
        data4rendering.nextPage=current+1;
    }

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-main").innerHTML,
        data4rendering
    );


       /* return `<h1>Main Content</h1>
                ${current} <br>
                ${totalCount} <br>
                ${JSON.stringify(data4rendering)}
                `;*/

}

function createHtml4opinions(targetElm){
    const opinionsFromStorage=localStorage.myTreesComments;
    let opinions=[];

    if(opinionsFromStorage){
        opinions=JSON.parse(opinionsFromStorage);
        opinions.forEach(opinion => {
            opinion.created = (new Date(opinion.created)).toDateString();
            opinion.willReturn = opinion.willReturn?"I will return to this page.":"Sorry, one visit was enough.";
        });
    }

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-opinions").innerHTML,
        opinions
    );
}


function fetchAndDisplayArticles(targetElm, current, totalCount){
    const url = "https://wt.kpi.fei.tuke.sk/api/article";
    let articleList =[];
    if(current === "0"){
        current=parseInt(current) + 1;
        totalCount=parseInt(totalCount) + 1;
    } else {
        current=parseInt(current);
        totalCount=parseInt(totalCount);
    }
    const data4rendering={
        currPage: current,
        pageCount: totalCount,
        offset: (current-1) * 20
    };
    if(current>1){
        data4rendering.prevPage=current-1;
    }

    if(current<totalCount){
        data4rendering.nextPage=current+1;
    }

    fetch(url+ "/?max=20" + "&offset=" + data4rendering.offset)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{ //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            articleList=responseJSON.articles;
            return Promise.resolve();
        })
        .then( ()=> {
            let cntRequests = articleList.map(
                article => fetch(`${url}/${article.id}`)
            );
            return Promise.all(cntRequests);
        })
        .then(responses =>{
            let failed="";
            for(let response of responses) {
                if(!response.ok) failed+=response.url+" ";
            }
            if(failed===""){
                return responses;
            }else{
                return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}.`));
            }
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(articles => {
            articles.forEach((article,index) =>{
                articleList[index].content=article.content;
            });

            return Promise.resolve();
        })
        .then( () =>{
            let data = [];
            data.articles = articleList;
            data.currPage = data4rendering.currPage;
            data.pageCount = data4rendering.pageCount;
            data.prevPage = data4rendering.prevPage;
            data.nextPage = data4rendering.nextPage;
            document.getElementById(targetElm).innerHTML =Mustache.render(document.getElementById("template-articles").innerHTML, data);
        })
        .catch (error => { ////here we process all the failed promises
            const errMsgObj = {errMessage:error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });

    console.log("articleList: " + articleList);
}
/*
function fetchAndDisplayArticles(targetElm){

    const url = "http://wt.kpi.fei.tuke.sk/api/article/?max=20&offset=0";


    const articlesElm = document.getElementById("articles");
    const errorElm = document.getElementById("error");

    let articleList =[];



    fetch(url)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{ //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            articleList=responseJSON.articles;
            return Promise.resolve();
        })
        .then( ()=> {
            let cntRequests = articleList.map(
                article => fetch(`${"http://wt.kpi.fei.tuke.sk/api/article"}/${article.id}/${"offset=1"}`)
                );
            return Promise.all(cntRequests);
        })
        .then(responses =>{
            let failed="";
            for(let response of responses) {
                if(!response.ok) failed+=response.url+" ";
            }
            if(failed===""){
                return responses;
            }else{
                return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}.`));
            }
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(articles => {
            articles.forEach((article,index) =>{
                articleList[index].content=article.content;
            });

            return Promise.resolve();
        })
        .then( () =>{

            let data = [];
            data.articles = articleList;


            document.getElementById(targetElm).innerHTML =Mustache.render(document.getElementById("template-articles").innerHTML, data);
        })
        .catch (error => { ////here we process all the failed promises
            const errMsgObj = {errMessage:error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });

}
*/


