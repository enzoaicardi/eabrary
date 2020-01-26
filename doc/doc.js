// DOCJS

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const page = urlParams.get('page')

if(queryString && urlParams && page){
    document.querySelector('title').textContent = 'EA | ' + page;
    ea('.ea-doc-body').include('pages/'+ page +'.html', 'pages/error404.html');
}else{
    document.querySelector('title').textContent = 'EA | Documentation : ea';
    ea('.ea-doc-body').include('pages/ea.html');
}
