// SCRIPT 

let info = document.querySelector('.info');
let canva = document.querySelector('.canva');
let main = document.querySelector('main');
let svg = main.querySelector('svg');
let mode = 'M';
let currentPath = 0;
let stock = 0;
let CPA = [];
let pnt = 'block';
let down = false, point_select = null;
let manual_opacity = 0.5;
let gridDiviser = 1;
let defaultGrid = 0;

// STYLES

let colorFill = document.querySelector('#colorFill');
let colorStroke = document.querySelector('#colorStroke');
let colorGrid = document.querySelector('#colorGrid');
let vbColor = document.querySelector('#vbColor');

// FONCTIONS

function updateLocal(){

    if(localStorage.length > 0){

        let localbase = document.querySelector('.localbase');
        let savename = document.querySelectorAll('.localbase > div p');

        if(document.querySelector('.save-to-delete')){
            localbase.removeChild(document.querySelector('.save-to-delete'));
        }

        for(let [key, value] of Object.entries(localStorage)){

            let exist = false;

            for(let i=0;i<savename.length;i++){
                if(key === savename[i].textContent){exist = true;}
            }

            if(exist === false){

                let name = document.createElement('p');
                let iconsvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                let svguse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                let save = document.createElement('div');
                let del = document.createElement('div');

                svguse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#icon-cloud-upload');

                save.classList.add('dbl-to-apply');
                del.classList.add('clc-to-delete');

                name.textContent = key;
                del.textContent = 'x';
                del.setAttribute('data-save', key);

                iconsvg.appendChild(svguse);
                save.appendChild(iconsvg);

                save.appendChild(name);
                save.appendChild(del);

                localbase.insertBefore(save, localbase.childNodes[0]);

            }
            
        }

    }

}
updateLocal();

function useLocal(name){
    openSCP(localStorage.getItem(name));
    document.querySelector('#local-name').value = name;
}

function createSCP(){

    let path = svg.querySelectorAll('path');
    let settheVB = svg.getAttribute('viewBox').replace('0 0 ', '');
    let scptext = settheVB + '°';

    for(let i=0;i<path.length;i++){
           
        let data_id = path[i].getAttribute('data-id');
        let all_attr = updateAttr(data_id) + 'data-id: ' + data_id;
        let path_d = path[i].getAttribute('d');

        if(path_d == ''){path_d = 'd';}

        let points = document.querySelectorAll('.point');
        let ptn_text = '';

        if(i>0){scptext = scptext + '°';}

        for(let u=0, w=0;u<points.length;u++){

            if(points[u].getAttribute('data-path') == data_id){

                if(w>0){ptn_text = ptn_text + '|';}
                w++;

                ptn_text = ptn_text + data_id + '!' + points[u].getAttribute('data-letter') 
                + '!' + points[u].getAttribute('data-position')
                + '!' + points[u].getAttribute('data-inside-position');

            }

        }

        scptext = scptext + path_d + '+' + all_attr + '+' + ptn_text;
        
    }

    return scptext;

}

function openSCP(string){

    let all_datas = string.split('°');

    // ajouter les path ID aux createPath, points (et englobe auto de fait)
    // ajouter tout les attributs en fonction de pathID
    // update

    // ne pas faire a partir de copy_array mais de all_datas 1,2,... en prélevant les pathData 

    // pour createPath et definir les data-id (pour le bon fonctionnement)
    // necessite une petite modif de createPath (voir updateAttr)

    // createPath pour tout les paths mais delete tout les autres paths avant pour eviter bugs
    let past_path = svg.querySelectorAll('path');
    let past_englobe = document.querySelectorAll('.chemins .englobe');

    for(let i=0; i<past_path.length;i++){
        past_path[i].setAttribute('data-id', 'del');
        past_englobe[i].setAttribute('data-id', 'del');
        past_englobe[i].querySelector('article').setAttribute('data-id', 'del');
    }

    let past_point = document.querySelectorAll('.point');

    for(let i=0; i<past_point.length;i++){
        main.removeChild(past_point[i]);
    }

    // Et reset CPA (si pas deja fait)
    CPA = [];
    let newCoord = [];

    // set la nouvelle viewbox
    let newViewBox = all_datas[0].match(/[0-9-]{1,}/g);
    document.querySelector('.x').value = newViewBox[0];
    document.querySelector('.y').value = newViewBox[1];

    updateViewBox();

    // all_datas 0 = viewbox
    // all_datas 1 : [path_d (ou d si rien) + '+' + all_attr + '+' + ptn_text] ° all_datas 2 :  [...]
    for(let i=1;i<all_datas.length;i++){

        let newPath = all_datas[i].split('+');

        let data_id = newPath[1].match(/(?<=data-id: )[0-9]{1,}/);
        let newAttr = newPath[1].replace(/data-id: [0-9]{1,}/, '');

        newCoord[data_id] = newPath[0].match(/[A-Z] ([0-9-]{1,} [0-9-]{1,} {0,1}){1,}/g);

        // create the path with manual_id
        // on update a la fin grace au tableau newCoord pour mettre le chemin de manière automatique
        createPath(data_id);
        // devient le currentPath
        setAttr(data_id, newAttr);
        // update attr
        updateAttr(data_id);

        // on delete les anciens path si i=0
        if(i === 1){
            for(let u=0;u<past_path.length;u++){
                deletePath('del');
            }
        }

        // seulement si le chemin contient des coordonnées
        if(newPath[0] !== 'd'){

            let newPoint = newPath[2].split('|');

            // explore newCoord array
            for(let u=0;u<newCoord[data_id].length;u++){

                newCoord[data_id][u] = newCoord[data_id][u].match(/([A-Z]|[0-9-]{1,} [0-9-]{1,})/g);

            }

            // explore newPoint attr
            for(let u=0;u<newPoint.length;u++){

                let divAttr = newPoint[u].split('!');

                let ptn_path = divAttr[0];
                let ptn_letter = divAttr[1];
                let ptn_position = divAttr[2];
                let ptn_inside_position = divAttr[3];

                let coord = newCoord[ptn_path][ptn_position][ptn_inside_position].match(/[0-9-]{1,}/g);

                // definir x et y
                let x = parseInt(coord[0], 10) * 10;
                let y = parseInt(coord[1], 10) * 10;  

                createPoint(ptn_inside_position, ptn_letter, x, y, ptn_position, ptn_path);

            }

        }else{
            newCoord[data_id] = [];
        }

        // on update visibility des calques
        updateCalc(data_id);

        // on met a jour le tableau
        CPA[data_id] = newCoord[data_id];

        update(data_id);

    }

}

function updateViewBox(diviser){

    if(diviser){gridDiviser = diviser;}

    svg.setAttribute('viewBox', '0 0 ' + document.querySelector('.x').value + ' ' + document.querySelector('.y').value);
    
    // VBx = document.querySelector('.x').value;
    // VBy = document.querySelector('.y').value;

    main.style.width = document.querySelector('.x').value * 10 + 'px';
    main.style.height = document.querySelector('.y').value * 10 + 'px';

    // delete child before

    let col = main.querySelector('.col');
    let row = main.querySelector('.row');

    let colDiv = col.querySelectorAll('div');
    let rowDiv = row.querySelectorAll('div');

    for(let i = 0; i < colDiv.length; i++){
        col.removeChild(colDiv[i]);
    }

    for(let i = 0; i < rowDiv.length; i++){
        row.removeChild(rowDiv[i]);
    }

    // create new child

    let numCol = parseInt(document.querySelector('.y').value, 10) / gridDiviser;
    let numRow = parseInt(document.querySelector('.x').value, 10) / gridDiviser;

    let newMargin = (10*gridDiviser)-1;

    for(let i = 0; i < numCol; i++){
        let colElem = document.createElement('div');
        colElem.style.marginBottom = newMargin + 'px';
        colElem.style.backgroundColor = col.getAttribute('data-color');
        col.appendChild(colElem);
    }

    for(let i = 0; i < numRow; i++){
        let rowElem = document.createElement('div');
        rowElem.style.marginRight = newMargin + 'px';
        rowElem.style.backgroundColor = row.getAttribute('data-color');
        row.appendChild(rowElem);
    }

}

function updateGrid(){

    let gridIcon = document.querySelector('.seegrid > svg > use');

    let col = main.querySelector('.col');
    let row = main.querySelector('.row');

    if(defaultGrid == 0){
        col.style.visibility = 'visible';
        row.style.visibility = 'visible';
        updateViewBox(1);
        gridIcon.setAttribute('xlink:href', '#icon-grid_on');
        defaultGrid = 1;
    }
    else if(defaultGrid == 1){
        updateViewBox(2);
        gridIcon.setAttribute('xlink:href', '#icon-grid_view');
        defaultGrid = 2;
    }
    else if(defaultGrid == 2){
        updateViewBox(4);
        gridIcon.setAttribute('xlink:href', '#icon-grid');
        defaultGrid = 3;
    }
    else if(defaultGrid == 3){
        col.style.visibility = 'hidden';
        row.style.visibility = 'hidden';
        gridIcon.setAttribute('xlink:href', '#icon-grid_off');
        defaultGrid = 0;
    }

}

function getViewBox(){

    let theviewbox = svg.getAttribute('viewBox');
    theviewbox = theviewbox.replace('0 0 ', '');

    let group = theviewbox.match(/[0-9-]{1,}/g);

    return {
        x: group[0],
        y: group[1]
    };

}

function flashPath(path_id, unflash){

    let path = svg.querySelectorAll('path');

    for(let i=0; i<path.length; i++){
        if(path[i].getAttribute('data-id') == path_id){
            if(unflash === true){
                path[i].style.filter = 'none';
            }else{
                path[i].style.filter = 'url(#bright)';
            } 
        }
    }

}

function updateAttr(pos){

    let isset = true;
    if(!pos && pos !== 0 && pos !== '0'){pos = currentPath;isset = false}

    let input = document.querySelector('.editeur #attr'),
        path = svg.querySelectorAll('path');

    let txt = '';

    for(let i=0; i<path.length; i++){
        if(path[i].getAttribute('data-id') == pos){

            let attr = path[i].attributes;

            for(let u=0; u<attr.length; u++){
                if(attr[u].name !== 'data-id' && attr[u].name !== 'd' && attr[u].name !== 'style'){
                    txt = txt + attr[u].name + ': ' + attr[u].value + ' / '

                    if(attr[u].name == 'fill'){
                        colorFill.style.backgroundColor = attr[u].value;
                    }else if(attr[u].name == 'stroke'){
                        colorStroke.style.backgroundColor = attr[u].value;
                    }
                }
            }

        }
    }

    if(isset === true){
        return txt;
    }else{
        input.value = txt;
    }

}
updateAttr();

function setAttr(path_id, string){

    let input = document.querySelector('.editeur #attr'),
        path = svg.querySelectorAll('path');

    let array = input.value.split('/');

    if(!path_id && path_id !== 0 && path_id !== '0'){path_id = currentPath;}
    if(string){array = string.split('/');}

    for(let u=0; u<path.length; u++){

        if(path[u].getAttribute('data-id') == path_id){

            for(let i=0; i<array.length; i++){

                array[i] = array[i].replace(/ /g, '');
                array[i] = array[i].split(':');

                if(array[i][0] && array[i][1] && array[i][0] !== 'style' && array[i][0] !== 'd' && array[i][0] !== 'data-id'){

                    array[i][0] = array[i][0].replace(/ /g, '');
                    array[i][1] = array[i][1].replace(/ /g, '');

                    if(array[i][0].match(/^\.\./)){

                        let attrtrm = array[i][0].replace('..', '');

                        if(attrtrm == 'stroke'){

                            path[u].setAttribute(attrtrm, 'transparent');
                            colorStroke.style.backgroundColor = 'transparent';
                            document.querySelectorAll('article')[u].style.borderRight = '10px solid transparent';
                        
                        }else if(attrtrm == 'fill'){
    
                            path[u].setAttribute(attrtrm, 'transparent');
                            colorFill.style.backgroundColor = 'transparent';
                            document.querySelectorAll('article')[u].style.backgroundImage = 'linear-gradient(to top, transparent, transparent)';
                        
                        }else{

                            path[u].removeAttribute(attrtrm);

                        }

                    }else{
                        path[u].setAttribute(array[i][0], array[i][1]);
                    }

                    if(array[i][0] == 'stroke'){

                        colorStroke.style.backgroundColor = array[i][1];
                        document.querySelectorAll('article')[u].style.borderRight = '10px solid '+array[i][1];
                    
                    }else if(array[i][0] == 'fill'){

                        colorFill.style.backgroundColor = array[i][1];
                        document.querySelectorAll('article')[u].style.backgroundImage = 'linear-gradient(to top, '+array[i][1]+', '+array[i][1]+')';
                    
                    }

                }

            }

        }

    }

}

function createPath(manual_id){

    let newid = stock;

    if(manual_id){

        newid = manual_id;

        if(stock <= parseInt(manual_id, 10)){
            stock = parseInt(manual_id, 10) + 1;
        }
    
    }else{
        stock++;
        newid = stock;
    }

    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('data-id', newid);
    path.setAttribute('fill', 'white');
    path.setAttribute('stroke', 'black');
    path.setAttribute('stroke-width', '0.2');
    path.setAttribute('d', '');

    svg.appendChild(path);

    let chemin = document.querySelector('.chemins > .englobe').cloneNode(true);
    chemin.setAttribute('data-id', newid);
    chemin.className = 'englobe';
    chemin.style.opacity = '1';
    chemin.querySelector('article').innerHTML = '<span style="background-color:rgb(195, 195, 195);">d :</span>';
    chemin.querySelector('article').className = 'pathdata path_'+newid;
    chemin.querySelector('article').setAttribute('data-id', newid);
    chemin.querySelector('.idpath').querySelector('p').textContent = newid;
    chemin.querySelector('article').style.borderRight = '10px solid black';
    chemin.querySelector('article').style.backgroundImage = 'linear-gradient(to top, white, white)';

    document.querySelector('.chemins').appendChild(chemin);

    changeFocus(document.querySelector('.path_'+newid));

}

function deletePath(number){

    if(svg.querySelectorAll('path').length > 1){

        for(let i=0; i<svg.querySelectorAll('path').length; i++){
            if(svg.querySelectorAll('path')[i].getAttribute('data-id') == number){

                if(svg.querySelectorAll('path')[i+1]){
                    changeFocus(svg.querySelectorAll('path')[i+1]);
                }else if(svg.querySelectorAll('path')[i-1]){
                    changeFocus(svg.querySelectorAll('path')[i-1]);
                }else{
                    changeFocus(svg.querySelectorAll('path')[0]);
                }

                svg.removeChild(svg.querySelectorAll('path')[i]);
            }
        }

        for(let i=0; i<document.querySelectorAll('.chemins .englobe').length; i++){
            if(document.querySelectorAll('.chemins .englobe')[i].getAttribute('data-id') == number){
                document.querySelector('.chemins').removeChild(document.querySelectorAll('.chemins .englobe')[i]);
            }
        }

        let point = document.querySelectorAll('.point');

        for(let i=0; i<point.length; i++){
            if(point[i].getAttribute('data-path') == number){
                main.removeChild(point[i]);
            }
        }

    }

}

function changeFocus(elem){
    
    currentPath = elem.getAttribute('data-id');
    if(!elem.getAttribute('data-id') && elem.getAttribute('data-id') !== 0  && elem.getAttribute('data-id') !== '0'){
        currentPath = elem.getAttribute('data-path');
    }

    if(document.querySelector('.selected')){
        document.querySelector('.selected').classList.remove('selected');
    }

    let englobe = document.querySelectorAll('.englobe');

    for(let i=0; i<englobe.length;i++){
        if(englobe[i].getAttribute('data-id') == currentPath){
            englobe[i].classList.add('selected');
        }
    }

    updateAttr();

}

function changePosition(elem, opp){

    let path = svg.querySelectorAll('path');
    let chemins = document.querySelector('.chemins');
    let englobe = chemins.querySelectorAll('.englobe');

    let pos = elem.getAttribute('data-id');

    if(path.length > 1){

        if(opp === 'up'){

            for(let i=0; i<path.length; i++){
                if(path[i].getAttribute('data-id') == pos){

                    if(path[i-1]){

                        let tomove = path[i];
                        svg.insertBefore(tomove,path[i-1]);

                    }
                    
                }
            }
            for(let i=0; i<englobe.length; i++){
                if(englobe[i].getAttribute('data-id') == pos){

                    if(englobe[i-1]){

                        let tomove = englobe[i];
                        chemins.insertBefore(tomove,englobe[i-1]);

                    }
                    
                }
            }
        }

        if(opp === 'down'){

            for(let i=0; i<path.length; i++){
                if(path[i].getAttribute('data-id') == pos){

                    if(path[i+1]){

                        let tomove = path[i];
                        svg.insertBefore(tomove,path[i+1].nextSibling);

                    }
                    
                }
            }
            for(let i=0; i<englobe.length; i++){
                if(englobe[i].getAttribute('data-id') == pos){

                    if(englobe[i+1]){

                        let tomove = englobe[i];
                        chemins.insertBefore(tomove,englobe[i+1].nextSibling);

                    }
                    
                }
            }
        }

    }

}

function changeFill(color, stroke){

    let path = svg.querySelectorAll('path');
    let chemins = document.querySelector('.chemins');
    let englobe = chemins.querySelectorAll('.englobe');

    for(let i=0; i<path.length; i++){
        if(path[i].getAttribute('data-id') == currentPath){
            if(stroke === true){
                path[i].setAttribute('stroke', color);
            }else{
                path[i].setAttribute('fill', color);
            }
        }
    }
    for(let i=0; i<englobe.length; i++){
        if(englobe[i].getAttribute('data-id') == currentPath){
            if(stroke === true){
                englobe[i].querySelector('article').style.borderRight = '10px solid '+color;
            }else{
                englobe[i].querySelector('article').style.backgroundImage = 'linear-gradient(to top, '+color+', '+color+')';
            }
            
        }
    }

    updateAttr();

}

function createPoint(p, t, xpos, ypos, position, path_id){

    if(!path_id && path_id !== 0 && path_id !== '0'){path_id = currentPath;}
    if(!position && position !== 0 && position !== '0'){position = CPA[currentPath].length - 1;}

    let point = document.createElement('div');
    point.classList.add('point');
    point.setAttribute('data-path', path_id);
    point.setAttribute('data-position', position);
    point.setAttribute('data-inside-position', p);
    point.setAttribute('data-letter', t);
    point.style.left = (xpos - 9) + 'px';
    point.style.top = (ypos - 9) + 'px';
    point.style.display = pnt;
    point.textContent = t;

    if(t === 'b'){point.style.backgroundColor = 'rgba(51, 122, 18, '+manual_opacity+')';}
    if(t === 'd'){point.style.backgroundColor = 'rgba(22, 163, 139, '+manual_opacity+')';}
    if(t === 'M'){point.style.backgroundColor = 'rgba(201, 147, 0, '+manual_opacity+')';}
    if(t === 'L'){point.style.backgroundColor = 'rgba(24, 68, 136, '+manual_opacity+')';}
    if(t === 'C'){point.style.backgroundColor = 'rgba(199, 81, 26, '+manual_opacity+')';}
    if(t === 'Q'){point.style.backgroundColor = 'rgba(163, 22, 144, '+manual_opacity+')';}

    main.appendChild(point);

}

function deletePoint(elem){

    let point = document.querySelectorAll('.point');

    for(let i=0; i<point.length;i++){
        if(point[i].getAttribute('data-position') === elem.getAttribute('data-position') && point[i].getAttribute('data-path') === elem.getAttribute('data-path') && point[i].getAttribute('data-letter') == 'b'){
            main.removeChild(point[i]);
        }
    }

    main.removeChild(elem);
}

function changeMode(){
    
    document.querySelector('.cmode').classList.remove('cmode');

    selected_mode = document.querySelector('.letter_'+mode);
    selected_mode.classList.add('cmode');

}

function update(pos){

    if(!pos && pos !== 0 && pos !== '0'){pos = currentPath;}

    let inner = '<span style="background-color:rgb(195, 195, 195);">d :</span>';
    let array = CPA[pos];

    let paths = svg.querySelectorAll('path');

    for(let i=0; i<paths.length; i++){
        if(paths[i].getAttribute('data-id') == pos){
            paths[i].setAttribute('d', array.flat(1).join(' '));
        }
    }

    for(let i=0;i<array.length;i++){

        let adder;

        if(array[i][0] == 'M'){
            adder = '<span style="background-color:rgba(201, 147, 0, '+manual_opacity+');">'+array[i].join(' ')+'</span>';
        }else if(array[i][0] == 'L'){
            adder = '<span style="background-color:rgba(24, 68, 136, '+manual_opacity+');">'+array[i].join(' ')+'</span>';
        }else if(array[i][0] == 'C'){
            adder = '<span style="background-color:rgba(199, 81, 26, '+manual_opacity+');">'+array[i].join(' ')+'</span>';
        }else if(array[i][0] == 'Q'){
            adder = '<span style="background-color:rgba(163, 22, 144, '+manual_opacity+');">'+array[i].join(' ')+'</span>';
        }else{
            adder = '<span style="background-color:rgba(128, 128, 128, '+manual_opacity+');">'+array[i].join(' ')+'</span>';
        }

        inner = inner + adder

    }

    document.querySelector('.path_'+pos).innerHTML = inner;

}

function preset(e){

    let rect = main.getBoundingClientRect();
    let x = e.clientX - rect.left,
        y = e.clientY - rect.top;

    return {
        rect: main.getBoundingClientRect(),
        x: x,
        y: y,
        VBx: Math.round(x / 10),
        VBy: Math.round(y / 10)
    };

}

function hideandsee(c){

    if(pnt == 'none'){
        pnt = 'block';
        document.querySelector('.indic').style.backgroundColor = 'green';
        document.querySelector('.letter_H').style.backgroundColor = '#cccccc';
    }else{
        pnt = 'none';
        document.querySelector('.indic').style.backgroundColor = 'red';
        document.querySelector('.letter_H').style.backgroundColor = '#ffffff';
    }

    for(let i=0; i<document.querySelectorAll(c).length;i++){
        document.querySelectorAll(c)[i].style.display = pnt;
    }

}

function hidepath(){

    let path = svg.querySelectorAll('path');
    let chemins = document.querySelector('.chemins');
    let englobe = chemins.querySelectorAll('.englobe');
    let point = document.querySelectorAll('.point');

    for(let i=0; i<path.length; i++){

        if(path[i].getAttribute('data-id') == currentPath){

            if(path[i].getAttribute('display') === 'none'){

                // path[i].style.display = 'block';
                path[i].removeAttribute('display');
                englobe[i].style.opacity = '1';

                for(let u=0; u<point.length;u++){
                    if(point[u].getAttribute('data-path') == currentPath){
                        point[u].style.visibility = 'visible';
                    }
                }

            }else{

                // path[i].style.display = 'none';
                path[i].setAttribute('display', 'none');
                englobe[i].style.opacity = '0.5';

                for(let u=0; u<point.length;u++){
                    if(point[u].getAttribute('data-path') == currentPath){
                        point[u].style.visibility = 'hidden';
                    }
                }

            }

        }

    }

    updateAttr();

}

function updateCalc(pos){

    let path = svg.querySelectorAll('path');
    let chemins = document.querySelector('.chemins');
    let englobe = chemins.querySelectorAll('.englobe');
    let point = document.querySelectorAll('.point');

    for(let i=0; i<path.length; i++){

        if(path[i].getAttribute('data-id') == pos){

            if(path[i].getAttribute('display') === 'none'){

                englobe[i].style.opacity = '0.5';

                for(let u=0; u<point.length;u++){
                    if(point[u].getAttribute('data-path') == pos){
                        point[u].style.visibility = 'hidden';
                    }
                }

            }

        }

    }

}

function subPos(pos, iD){

    let point = document.querySelectorAll('.point');

    for(let i=0; i<point.length;i++){
        if(point[i].getAttribute('data-position') > Number(pos) && point[i].getAttribute('data-path') == iD){
            point[i].setAttribute('data-position', Number(point[i].getAttribute('data-position')) - 1);
        }
    }

}

function addPos(pos, iD){

    let point = document.querySelectorAll('.point');

    for(let i=0; i<point.length;i++){
        if(point[i].getAttribute('data-position') >= Number(pos) && point[i].getAttribute('data-path') == iD){
            point[i].setAttribute('data-position', Number(point[i].getAttribute('data-position')) + 1);
        }
    }

}

// CREATION DE POINTS

canva.addEventListener('mousedown', (e)=>{

    let path = svg.querySelectorAll('path');
    let isvisible = true;

    for(let i=0; i<path.length; i++){
        if(path[i].getAttribute('data-id') == currentPath){
            if(path[i].getAttribute('display') === 'none'){
                isvisible = false;
            }
        }
    }

    if(isvisible === true){

    // si pas de array alors on l'ajoute
    if(!CPA[currentPath]){CPA[currentPath] = [];mode='M';}

    let array = [mode,preset(e).VBx + ' ' + preset(e).VBy];
    let insp = 1;
    let position = CPA[currentPath].length;

    if(e.which === 3 && point_select !== null && point_select.getAttribute('data-path') == currentPath){
        position = Number(point_select.getAttribute('data-position')) + 1;
        addPos(position, point_select.getAttribute('data-path'));
    }

    if(e.which === 2 && point_select !== null && point_select.getAttribute('data-path') == currentPath){
        position = Number(point_select.getAttribute('data-position'));
        addPos(position, point_select.getAttribute('data-path'));
        e.preventDefault();
    }

    if(mode == 'C'){
        insp = 3;
        array = [mode,preset(e).VBx + ' ' + preset(e).VBy,
        preset(e).VBx + ' ' + preset(e).VBy,
        preset(e).VBx + ' ' + preset(e).VBy
        ];
    }else if(mode == 'Q'){
        insp = 2;
        array = [mode,preset(e).VBx + ' ' + preset(e).VBy,
        preset(e).VBx + ' ' + preset(e).VBy
        ];
    }

    CPA[currentPath].splice(position,0,array);
    createPoint(insp, mode, preset(e).x, preset(e).y, position);

    if(mode == 'M'){
        mode = 'L';
    }else if(mode == 'C'){
        createPoint(1, 'b', preset(e).x, preset(e).y, position);
        createPoint(2, 'b', preset(e).x, preset(e).y, position);
    }else if(mode == 'Q'){
        createPoint(1, 'd', preset(e).x, preset(e).y, position);
    }

    changeMode();

    update();

    }


});

// DELETE POINT

document.addEventListener('dblclick', (e)=>{

    // use local
    if(e.target.classList == 'dbl-to-apply' || e.target.parentNode.classList == 'dbl-to-apply'){
        
        let savename;

        if(e.target.parentNode.classList[0] === 'dbl-to-apply'){
            savename = e.target.parentNode.querySelector('p').textContent;
        }else{
            savename = e.target.querySelector('p').textContent;
        }

        useLocal(savename);

    }

    // delete point
    if(e.target.classList == 'point' && e.target.getAttribute('data-path') == currentPath && e.target.getAttribute('data-letter') !== 'b' && e.target.getAttribute('data-letter') !== 'd'){

        let pathID = e.target.getAttribute('data-path'),
        position = e.target.getAttribute('data-position');

        CPA[pathID].splice(position,1);

        deletePoint(e.target);
        subPos(position, pathID);
        update();

    }
    

});


// CREATE POINT INSIDE PREVEND DEFAULT

document.addEventListener('contextmenu', (e)=>{
    if(e.target == canva || e.target.classList == 'point'){
        e.preventDefault();
    }
});


// TOUT LES EDITS

// STROKE FILL

const colorFillPicker = new Picker({
    parent: colorFill,
    popup: 'top',
    color: '#000000',
    editorFormat: 'rgb',
    alpha: true,
    editor: true
});

colorFillPicker.onChange = function(color) {
    colorFill.style.backgroundColor = color.rgbaString;
    changeFill(color.rgbaString, false);
};

// STROKE COLOR

const colorStrokePicker = new Picker({
    parent: colorStroke,
    popup: 'top',
    color: '#000000',
    editorFormat: 'rgb',
    alpha: true,
    editor: true
});

colorStrokePicker.onChange = function(color) {
    colorStroke.style.backgroundColor = color.rgbaString;
    changeFill(color.rgbaString, true);
};

// GRID COLOR

const colorGridPicker = new Picker({
    parent: colorGrid,
    popup: 'top',
    color: 'rgba(32,113,162,0.3)',
    editorFormat: 'rgb',
    alpha: true,
    editor: true
});

colorGridPicker.onChange = function(color) {

    colorGrid.style.backgroundColor = color.rgbaString;

    let allgrid = main.querySelectorAll('.grid > div');
    for(let i=0;i<allgrid.length;i++){
        allgrid[i].style.backgroundColor = color.rgbaString;
    }

    main.querySelector('.col').setAttribute('data-color', color.rgbaString);
    main.querySelector('.row').setAttribute('data-color', color.rgbaString);

};

// VB COLOR

const vbColorPicker = new Picker({
    parent: vbColor,
    popup: 'left',
    color: '#cfcfcf',
    editorFormat: 'rgb',
    alpha: true,
    editor: true
});

vbColorPicker.onChange = function(color) {
    vbColor.style.backgroundColor = color.rgbaString;
    main.style.backgroundColor = color.rgbaString
};

// MOUSEDOWN / UP -> MOVE POINTS +  SUITE EDITS

document.addEventListener('mousedown', (e)=>{
    if(e.target.classList == 'point'){
        point_select = e.target;
        down = true;

        document.querySelector('.pointmode p').textContent = point_select.getAttribute('data-letter');
        document.querySelector('.pointlocal p').textContent = point_select.getAttribute('data-position');
        document.querySelector('.pointchemin p').textContent = point_select.getAttribute('data-path');

        changeFocus(point_select);
    }
    // créer path
    if(e.target == document.querySelector('.addpath use') || e.target == document.querySelector('.addpath') || e.target == document.querySelector('.addpath svg')){
        createPath();
        changeMode();
    }
    // delete path
    if(e.target == document.querySelector('.deletepath use') || e.target == document.querySelector('.deletepath') || e.target == document.querySelector('.deletepath svg')){
        deletePath(currentPath);
    }
    // change grid visual
    if(e.target == document.querySelector('.seegrid use') || e.target == document.querySelector('.seegrid') || e.target == document.querySelector('.seegrid svg')){
        updateGrid();
    }
    // hide path
    if(e.target == document.querySelector('.hideandsee use') || e.target == document.querySelector('.hideandsee') || e.target == document.querySelector('.hideandsee svg')){
        hidepath();
    }
    // save local
    if(e.target == document.querySelector('.save-local use') || e.target == document.querySelector('.save-local svg')){
        let localName = document.querySelector('.save-local #local-name').value;
        localStorage.setItem(localName,createSCP());
        document.querySelector('.save-local > svg > use').setAttribute('xlink:href', '#icon-save-disk-valid');
        updateLocal();
    }else{
        // on update l'icon
        document.querySelector('.save-local > svg > use').setAttribute('xlink:href', '#icon-save-disk');
    }
    // set attr
    if(e.target == document.querySelector('.attributes use') || e.target == document.querySelector('.attributes svg')){
        setAttr();
        updateAttr();
    }
    // up path
    if(e.target.classList[0] == 'uppath'){
        changePosition(e.target.parentNode.parentNode, 'up');
    }
    // down path
    if(e.target.classList[0] == 'downpath'){
        changePosition(e.target.parentNode.parentNode, 'down');
    }
    // download
    if(e.target == document.querySelector('.download use') || e.target == document.querySelector('.download') || e.target == document.querySelector('.download svg')){
        
        // prepare DL .svg
        document.querySelector('.download-popup').style.visibility = 'visible';
        document.querySelector('.download-popup').style.transform = 'translateY(0px)';        
        document.querySelector('.download-popup').style.opacity = '1';  

        let text = svg.outerHTML;
        text = text.replace(/ {2,}/g, ' ');
        text = text.replace(/\t/g, '');
        text = text.replace(/ </g, '<');
        text = text.replace(/> /g, '>');
        text = text.replace(/>[ ]{0,}<\/svg/g, '>\n</svg');
        text = text.replace(/>[ ]{0,}<path/g, '>\n<path');
        text = text.replace(/data-id="[0-9]{1,}" /g, '');
        text = text.replace(/<path/g, '    <path');
        text = text.replace(/\n {0,} \n/g, '\n');

        dltext = text.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');

        document.querySelector('.btdl').setAttribute('href', 'data:image/svg+xml;utf8,'+dltext);
        document.querySelector('.fullsvg').textContent = text;

        text = text.replace(/<svg/g, '\n        <symbol id="svg-clean"');
        text = text.replace(/<\/svg>/g, '        </symbol>\n');
        text = text.replace(/<path/g, '        <path');

        text = '<svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n    <defs>' + text;
        text = text + '    </defs>\n</svg>'

        document.querySelector('.symbol').textContent = text;

        document.querySelector('.use').textContent = '<svg><use xlink:href="#svg-clean"></use></svg>';

        // prepare DL .scp
        // CREATESCP() return scptext

        document.querySelector('.btscp').setAttribute('href', 'data:image/svg+xml;utf8,'+createSCP());

    }

    // mask dl popup
    if(e.target == document.querySelector('.btclose')){
        
        document.querySelector('.download-popup').style.visibility = 'hidden';
        document.querySelector('.download-popup').style.transform = 'translateY(-30px)';        
        document.querySelector('.download-popup').style.opacity = '0';

    }

    // help popup show
    if(e.target == document.querySelector('.help use') || e.target == document.querySelector('.help') || e.target == document.querySelector('.help svg')){

        document.querySelector('.help-popup').style.display = 'flex';
    
    }

    // close help popup
    if(e.target == document.querySelector('.helpclose')){

        document.querySelector('.help-popup').style.display = 'none';

    }

    // mask local popup
    if(e.target == document.querySelector('.open-base use') || e.target == document.querySelector('.open-base')){ 
        document.querySelector('.localbase').style.display = 'flex';
    }
    // mask local popup
    if(e.target == document.querySelector('.closebase')){ 
        document.querySelector('.localbase').style.display = 'none';
    }
    // delete local save
    if(e.target.classList[0] == 'clc-to-delete'){
        localStorage.removeItem(e.target.getAttribute('data-save'));
        document.querySelector('.localbase').removeChild(e.target.parentNode);
    }
    // supprimer etc...

    // select path
    if(e.target.classList[0] == 'pathdata'){
        changeFocus(e.target);
    }
    if(e.target.tagName == 'SPAN' && e.target.parentNode.classList[0] == 'pathdata'){
        changeFocus(e.target.parentNode);
    }

    // change mode
    if(e.target == document.querySelector('.letter_M')){
        mode = 'M';
        changeMode();
    }else if(e.target == document.querySelector('.letter_L')){
        mode = 'L';
        changeMode();
    }else if(e.target == document.querySelector('.letter_C')){
        mode = 'C';
        changeMode();
    }else if(e.target == document.querySelector('.letter_Q')){
        mode = 'Q';
        changeMode();
    }else if(e.target == document.querySelector('.letter_H')){
        hideandsee('.point');
    }

});
document.addEventListener('mouseup', (e)=>{
    down = false;
});

// OPEN SAVE

let openSave = document.querySelector('.save #open-save');
openSave.addEventListener('change', (e)=>{

    let file = openSave.files[openSave.files.length-1];
    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function() {

        openSCP(reader.result);

    };

    openSave.value = null;

});

// MOUSEMOVE INDICATEUR

document.addEventListener('mousemove', (e)=>{

    if(e.target == canva || e.target.classList == 'point'){

        if(info.style.visibility == 'hidden'){info.style.visibility = 'visible';}

        info.style.left = preset(e).x + 16 + 'px';
        info.style.top = preset(e).y + 16 + 'px';

        info.textContent = 'x : ' 
        + (preset(e).VBx - getViewBox().x/2)
        + '\ny : ' 
        + (preset(e).VBy - getViewBox().y/2);

    }

    // Si on drap and drop un point
    if(down === true && point_select.getAttribute('data-path') == currentPath){

        point_select.style.left = (preset(e).x - 9) + 'px';
        point_select.style.top = (preset(e).y - 9) + 'px';

        let pathID = point_select.getAttribute('data-path'),
        position = point_select.getAttribute('data-position'),
        iP = point_select.getAttribute('data-inside-position');

        CPA[pathID][position][iP] = preset(e).VBx + ' ' + preset(e).VBy;
        update();

    }

});

// INDICATOR INVISIBLE

main.addEventListener('mouseleave', (e)=>{
    info.style.visibility = 'hidden';
});

document.querySelector('.chemins').addEventListener('mouseover', (e)=>{

    if(e.target.tagName == 'ARTICLE'){
        flashPath(e.target.getAttribute('data-id'));
    }

    if(e.target.parentNode.tagName == 'ARTICLE'){
        flashPath(e.target.parentNode.getAttribute('data-id'));
    }

});

document.querySelector('.chemins').addEventListener('mouseout', (e)=>{
    if(e.target.tagName == 'ARTICLE'){
        flashPath(e.target.getAttribute('data-id'), true);
    }
});

// KEYPRESS MODE (M L C)

document.addEventListener('keypress', (e)=>{

    // exclude text fields
    if(e.target !== document.querySelector('.attributes #attr') && e.target !== document.querySelector('.save-local #local-name')){

        if(e.key === 'm'){
            mode = 'M';
        }else if(e.key === 'l'){
            mode = 'L';
        }else if(e.key === 'c'){
            mode = 'C';
        }else if(e.key === 'q'){
            mode = 'Q';
        }

        // VISIBLE / INVISIBLE

        else if(e.key === 'h'){
            hideandsee('.point');
        }else if(e.key === 's'){
            if(document.querySelector('.localbase').style.display === 'flex'){
                document.querySelector('.localbase').style.display = 'none';
            }else{
                document.querySelector('.localbase').style.display = 'flex';
            }
        }

    }

    else if(e.key === 'Enter' && e.target === document.querySelector('.attributes #attr')){
        setAttr();
        updateAttr();
    }

    changeMode();

});

// KEYPRESS VIEWBOX

document.addEventListener('keyup', (e)=>{

    if((e.key.match(/[0-9]/) || e.key === 'Backspace') && (e.target == document.querySelector('.x') || e.target == document.querySelector('.y'))){
        
        updateViewBox();

    }

});

// ACTIVATION DE LA VISIBILITE

document.querySelector('.indic').addEventListener('click', (e)=>{
    hideandsee('.point');
});
