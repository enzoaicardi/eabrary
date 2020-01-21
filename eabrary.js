/*
    author: Enzo Aicardi
    version: 0.1
    date: 2020
    website: eabrary.com
*/
console.log("Eabrary js est chargé - les erreurs sont possibles mais le fichier est correctement renseigné");
let ea = (function() {

    'use strict';

    // THE CSS DEFAULT CLASS

        let head = document.querySelector('head');  
        let link = document.createElement('link'); 
  
        // set the attributes for link element  
        link.rel = 'stylesheet';  
        link.type = 'text/css';
        link.href = 'http://localhost:8887/Eabrary/eabrary/eabrary.css';  
  
        // Append link element to HTML head 
        head.appendChild(link);  

    // CONSTRUCTEUR

    // Creation du constructeur FUNC / OBJET
	let eaConstructor = function(selector, numberQ) {
		if (!selector) return;
		if (selector === 'document') {
			this.elems = [document];
		} else if (selector === 'window') {
			this.elems = [window];
		} else {
			if(typeof numberQ !== "undefined" && typeof numberQ === "number"){
                this.elems = [document.querySelectorAll(selector)[numberQ]];
            }else if(typeof numberQ !== "undefined" && typeof numberQ === "string" && RegExp(',').test(numberQ) === true){
                let Qarray = numberQ.split(',');
                let transitionArray = [];
                for(let i = 0; i < Qarray.length; ++i){
                    let transitionValue = parseInt(Qarray[i], 10);
                    transitionArray.push(document.querySelectorAll(selector)[transitionValue]);
                }
                this.elems = transitionArray;
            }else if(typeof numberQ !== "undefined" && typeof numberQ === "string" && RegExp('>').test(numberQ) === true){
                let Qarray = numberQ.split('>');
                let transitionArray = [];
                for(let i = parseInt(Qarray[0], 10); i < parseInt(Qarray[1], 10) + 1 && i < document.querySelectorAll(selector).length; ++i){
                    transitionArray.push(document.querySelectorAll(selector)[i]);
                }
                this.elems = transitionArray;
            }else{
                this.elems = document.querySelectorAll(selector);
            }
        }
	};


    // --------------------------------------------------------
    // Methodes de fonctionnement global
    // --------------------------------------------------------

        // EACH
	
        eaConstructor.prototype.each = function(callback) {
            if(!this.dly){this.dly = 0;}
            if(!this.intvl){this.intvl = 0;}

            let intervalT = this.intvl;
            let delayT = this.dly;

                setTimeout(() => {

                    if (!callback || typeof callback !== 'function') return;

                        for (let i = 0; i < this.elems.length; i++) {

                            setTimeout(() => {

                                callback(this.elems[i], i);
                                
                            }, i * intervalT);
                            
                        }

                    return this;

                }, delayT);
        };

        // DELAY

        eaConstructor.prototype.delay = function(duration) {
            const proxy = new Proxy(this, {
            get: (target, prop) => {
                const f = target[prop]
                return (...args) => {

                    if(!duration){duration = 0}

                    if(this.dly && duration !== "reset"){this.dly = this.dly + duration;}
                    else if(this.dly && duration == "reset"){this.dly = 0}
                    else{this.dly = duration;}
                    
                    return f.apply(target, [...args]);

                }
            }
            })
            return proxy;
        }

        // INTERVAL

        eaConstructor.prototype.interval = function(duration) {
            const proxy = new Proxy(this, {
            get: (target, prop) => {
                const f = target[prop]
                return (...args) => {

                    if(!duration || duration == "reset"){duration = 0}

                    if(this.dly || this.dly == 0){this.dly = this.dly + (this.intvl * (this.elems.length - 1));}
                    else{this.dly = 0}

                    this.intvl = duration;
                            
                    return f.apply(target, [...args]);

                }
            }
            })
            return proxy;
        }

        // EVENTLISTENER

        eaConstructor.prototype.on = function (evt, fcn, one) {
            let onetimeevent = false; if(one){onetimeevent = one;}
            this.each(function(item) {
                if (document.addEventListener) {      
                    item.addEventListener(evt, fcn, {once: onetimeevent});
                } else if (document.attachEvent) {           
                    item.attachEvent("on" + evt, fcn);
                } else {
                    item["on" + evt] = fcn;
                }
            });
            return this;
        };

        eaConstructor.prototype.off = function () {
            this.each(function(item) {
                var el = item,
                elClone = el.cloneNode(true);
                el.parentNode.replaceChild(elClone, el);
            });
            return this;
        }

        // LOAD 404

        function load404(urlI, item){
            let xhr = new XMLHttpRequest();
          
            xhr.onreadystatechange = (e) => {
              if (xhr.readyState == 4 && xhr.status == 200) {
                item.innerHTML = xhr.responseText;
              }
            }
          
            xhr.open("GET", urlI, true);
            xhr.setRequestHeader('Content-type', 'text/html');
            xhr.send();

        }

        // INCLUDE
        eaConstructor.prototype.include = function (urlI, url404){
            this.each(function(item){
            let xhr = new XMLHttpRequest();
          
            xhr.onreadystatechange = (e) => {
              if (xhr.readyState == 4 && xhr.status == 404) {
                load404(url404, item);
              }
              if (xhr.readyState == 4 && xhr.status == 200) {
                item.innerHTML = xhr.responseText;
              }
            }
          
            xhr.open("GET", urlI, true);
            xhr.setRequestHeader('Content-type', 'text/html');
            xhr.send();
            
            return this;
        });
        }

        // INTERSEC

        eaConstructor.prototype.intersec = function (parent, ratio, fnc, side) {
            this.each(function(item) {

                let container;

                if (parent === 'document') {
                    container = document;
                }else if (parent === 'window') {
                    container = window;
                }else{
                    container = document.querySelector(parent);
                }

                let options = {
                    root: container,
                    rootMargin: '0px',
                    threshold: ratio
                }
                  
                let observer = new IntersectionObserver(handleIntersect, options);
                observer.observe(item);

                function handleIntersect(entries) {
                    entries.forEach((entry) => {


                        if(side && entry.intersectionRatio > 0){
                            if(side == "top" && entry.boundingClientRect.top < entry.intersectionRect.top){
                                if(fnc){fnc();}
                                console.log("intersec - top" + entry.intersectionRect.y);
                            }
                            else if(side == "bottom" && entry.boundingClientRect.top >= entry.intersectionRect.top){
                                if(fnc){fnc();}
                                console.log("intersec - bottom");
                            }
                            else if(side == "left" && entry.boundingClientRect.left < entry.intersectionRect.left){
                                if(fnc){fnc();}
                                console.log("intersec - left");
                            }
                            else if(side == "right" && entry.boundingClientRect.left >= entry.intersectionRect.left){
                                if(fnc){fnc();}
                                console.log("intersec - right");
                            }
                        }else if(entry.intersectionRatio > 0 && !side){
                            if(fnc){fnc();}
                            console.log("intersec");
                        }
                        
                    });
                }
            });
            return this;
        };
        
        // METHOD SYNTAX TYPE
        // eaConstructor.prototype.color = function(color) {
        //     this.each(function(item) {
                
        //     });
        //     return this;
        // };

        // --------------------------------------------------------
        // Methodes de transition
        // --------------------------------------------------------

        // PROPERTY
        eaConstructor.prototype.cssproperty = function (property){
            this.each(function(item){
                item.style.transitionProperty = property;
            });
            return this;
        }

        // DURATION
        eaConstructor.prototype.cssduration = function (duration){
            this.each(function(item){
                item.style.transitionDuration = duration + 's';
            });
            return this;
        }

        // BEZIER
        eaConstructor.prototype.cssbezier = function (bezier){
            this.each(function(item){
                item.style.transitionTimingFunction = bezier;
            });
            return this;
        }

        // DELAY
        eaConstructor.prototype.cssdelay = function (delay){
            this.each(function(item){
                item.style.transitionDelay = delay + 's';
            });
            return this;
        }

        // TRANSITION
        eaConstructor.prototype.transition = function (string){
            this.each(function(item){
                item.style.transition = string;
            });
            return this;
        }

        // --------------------------------------------------------
        // Methodes de propriétés
        // --------------------------------------------------------

        // SET - property / value
        eaConstructor.prototype.set = function (property, value){
            this.each(function(item){
                item.style[property] = value;
            });
            return this;
        }

        // ------ Propriétés à virgule
        // -----------------------------

        // ADD - property / value
        eaConstructor.prototype.add = function (property, value){
            this.each(function(item){
                if(!item.getAttribute("style")){item.setAttribute("style", property + ":" + value + ";");}
                let chain = item.getAttribute("style");
                let regex = new RegExp(property+":([^;]*);", "g");
                let values = new RegExp(":([^;]*);", "g");
                let already = new RegExp(value, "g");
                
                let result = chain.match(regex);

                if(result !== null){
                    let resultvalues = result[0].match(values);
                    let resultalready = resultvalues[0].match(already);
                    if(resultalready == null){
                        let changestyle = chain.replace(result[0], "");
                        let nosemicolon = result[0].replace(";", "");
                            if(result[0] == property+":;"){
                                let addvalue = nosemicolon + value + ";";
                                item.setAttribute("style", changestyle + addvalue);
                            }else{
                                let addvalue = nosemicolon + "," + value + ";";
                                item.setAttribute("style", changestyle + addvalue);
                            }
                    }
                }else{item.style[property] = value;}
            });
            return this;
        }

        // REMOVE - property / value
        eaConstructor.prototype.remove = function (property, value){
            this.each(function(item){
                if(!item.getAttribute("style")){item.setAttribute("style", " ");}
                let chain = item.getAttribute("style");
                let regex = new RegExp(property+":([^;]*);", "g");
                let values = new RegExp(":([^;]*);", "g");
                let comma = new RegExp(","+value, "g");
                let commaspace = new RegExp(", "+value, "g");
                let nocomma = new RegExp(value, "g");
                
                let result = chain.match(regex);

                if(result !== null){
                    let resultvalues = result[0].match(values);
                    let resultcomma = resultvalues[0].match(comma);
                    let resultcommaspace = resultvalues[0].match(commaspace);
                    let resultnocomma = resultvalues[0].match(nocomma);
                    if(resultcomma !== null){
                        let changestyle = chain.replace(result[0], "");
                        let changed = resultvalues[0].replace(resultcomma[0], "");
                        changed = property + changed;

                        item.setAttribute("style", changestyle + changed);
                    }else if(resultcommaspace !== null){
                        let changestyle = chain.replace(result[0], "");
                        let changed = resultvalues[0].replace(resultcommaspace[0], "");
                        changed = property + changed;

                        item.setAttribute("style", changestyle + changed);
                    }else if(resultcomma == null && resultnocomma !== null){
                        let changestyle = chain.replace(result[0], "");
                        let changed = resultvalues[0].replace(resultnocomma[0]+",", "");
                        changed = changed.replace(resultnocomma[0]+" ,", "");
                        changed = property + changed;

                        item.setAttribute("style", changestyle + changed);
                    }
                }
            });
            return this;
        }

        // ADD - property / value
        eaConstructor.prototype.replace = function (property, value, newvalue){
            this.each(function(item){
                if(!item.getAttribute("style")){item.setAttribute("style", " ");}
                let chain = item.getAttribute("style");
                let regex = new RegExp(property+":([^;]*);", "g");
                let values = new RegExp(":([^;]*);", "g");
                let already = new RegExp(value, "g");
                
                let result = chain.match(regex);

                if(result !== null){
                    let resultvalues = result[0].match(values);
                    let resultalready = resultvalues[0].match(already);
                    if(resultalready !== null){   
                        let changestyle = chain.replace(result[0], "");
                        let addvalue = property + resultvalues[0].replace(resultalready[0], newvalue);
                        item.setAttribute("style", changestyle + addvalue);
                    }
                }
            });
            return this;
        }

        // DOM CSS CLEAR

        eaConstructor.prototype.clear = function (property){
            this.each(function(item){
                if(!property){item.setAttribute("style", " ");}
                else{
                    let chain = item.getAttribute("style");
                    let regex = new RegExp(property+":([^;]*);", "g");
                    let result = chain.match(regex);

                    if(result !== null){
                        let newchain = chain.replace(result[0], "");
                        item.setAttribute("style", newchain);
                    }
                }
            });
            return this;
        }

        // ADD / REMOVE CLASS

        eaConstructor.prototype.addclass = function (className) {
            this.each(function(item){
                item.classList.add(className);
            });
        };

        eaConstructor.prototype.removeclass = function (className) {
            this.each(function(item){
                item.classList.remove(className);
            });
        };

        // ------- Propriétés spéciales à espace (filter/transform)
        // ---------------------------------------------------------

        // SET - property / value
        eaConstructor.prototype.spaceset = function (property, inside, value){
            this.each(function(item){
                if(!item.getAttribute("style")){item.setAttribute("style", property + ": " + inside + "(" + value + ")" + ";");}
                let chain = item.getAttribute("style");
                let regex = new RegExp(property+":([^;]*);", "g");
                let values = new RegExp(":([^;]*);", "g");
                let already = new RegExp(inside+"\(([^\)])*\)([^ ;]*)", "g");
                
                let result = chain.match(regex);

                if(result !== null){
                    let resultvalues = result[0].match(values);
                    let resultalready = resultvalues[0].match(already);
                    if(resultalready == null){
                        let changestyle = chain.replace(result[0], "");
                        let nosemicolon = result[0].replace(";", "");
                            if(result[0] == property+":;"){
                                let addvalue = nosemicolon + inside + "(" + value + ")" + ";";
                                item.setAttribute("style", changestyle + addvalue);
                            }else{
                                let addvalue = nosemicolon + " " + inside + "(" + value + ")" + ";";
                                item.setAttribute("style", changestyle + addvalue);
                            }
                    }else if(resultalready !== null){   
                        let changestyle = chain.replace(result[0], "");
                        let addvalue = property + resultvalues[0].replace(resultalready[0], inside + "(" + value + ")");
                        item.setAttribute("style", changestyle + addvalue);
                    }
                    
                }
            });
            return this;
        }

        // ADD - property / value
        eaConstructor.prototype.spaceadd = function (property, inside, value){
            this.each(function(item){
                if(!item.getAttribute("style")){item.setAttribute("style", property + ": " + inside + "(" + value + ")" + ";");}
                let chain = item.getAttribute("style");
                let regex = new RegExp(property+":([^;]*);", "g");
                let values = new RegExp(":([^;]*);", "g");
                let already = new RegExp(inside+"\(([^\)])*\)([^ ;]*)", "g");
                
                let result = chain.match(regex);

                if(result !== null){
                    let resultvalues = result[0].match(values);
                    let resultalready = resultvalues[0].match(already);
                    if(resultalready == null){
                        let changestyle = chain.replace(result[0], "");
                        let nosemicolon = result[0].replace(";", "");
                            if(result[0] == property+":;"){
                                let addvalue = nosemicolon + inside + "(" + value + ")" + ";";
                                item.setAttribute("style", changestyle + addvalue);
                            }else{
                                let addvalue = nosemicolon + " " + inside + "(" + value + ")" + ";";
                                item.setAttribute("style", changestyle + addvalue);
                            }
                    }
                }else{item.style[property] = inside + "(" + value + ")";}
            });
            return this;
        }

        // REMOVE - property / value
        eaConstructor.prototype.spaceremove = function (property, value){
            this.each(function(item){
                if(!item.getAttribute("style")){item.setAttribute("style", " ");}
                let chain = item.getAttribute("style");
                let regex = new RegExp(property+":([^;]*);", "g");
                let values = new RegExp(":([^;]*);", "g");
                let space = new RegExp(" "+value+"\(([^\)]*)\)([^ ;]*)", "g");
                let nospace = new RegExp(value+"\(([^\)]*)\)([^ ;]*)", "g");
                
                let result = chain.match(regex);

                if(result !== null){
                    let resultvalues = result[0].match(values);
                    let resultspace = resultvalues[0].match(space);
                    let resultnospace = resultvalues[0].match(nospace);
                    if(resultspace !== null){
                        let changestyle = chain.replace(result[0], "");
                        let changed = resultvalues[0].replace(resultspace[0], "");
                        changed = property + changed;

                        item.setAttribute("style", changestyle + changed);
                    }else if(resultspace == null && resultnospace !== null){
                        let changestyle = chain.replace(result[0], "");
                        let changed = resultvalues[0].replace(resultnospace[0], "");
                        changed = property + changed;

                        item.setAttribute("style", changestyle + changed);
                    }
                }
            });
            return this;
        }

        // ADD - property / value
        eaConstructor.prototype.spacereplace = function (property, inside, newvalue){
            this.each(function(item){
                if(!item.getAttribute("style")){item.setAttribute("style", " ");}
                let chain = item.getAttribute("style");
                let regex = new RegExp(property+":([^;]*);", "g");
                let values = new RegExp(":([^;]*);", "g");
                let already = new RegExp(inside+"\(([^\)]*)\)([^ ;]*)", "g");
                
                let result = chain.match(regex);

                if(result !== null){
                    let resultvalues = result[0].match(values);
                    let resultalready = resultvalues[0].match(already);
                    if(resultalready !== null){   
                        let changestyle = chain.replace(result[0], "");
                        let addvalue = property + resultvalues[0].replace(resultalready[0], inside + "(" + newvalue + ")");
                        item.setAttribute("style", changestyle + addvalue);
                    }
                }
            });
            return this;
        }

        // DOM CSS CLEAR

        eaConstructor.prototype.spaceclear = function (property, inside){
            this.each(function(item){
                let chain = item.getAttribute("style");
                let regex = new RegExp(property+":([^;]*);", "g");
                let values = new RegExp(":([^;]*);", "g");
                let already = new RegExp(inside+"\(([^\)]*)\)([^ ;]*)", "g");

                let result = chain.match(regex);

                if(result !== null){
                    let resultvalues = result[0].match(values);
                    let resultalready = resultvalues[0].match(already);
                    let deleted = resultvalues[0].replace(resultalready[0], "");

                    let tchain = chain.replace(result[0], "");
                    let newchain = tchain + property + deleted;
                    newchain = newchain.replace("  ", " ");

                    item.setAttribute("style", newchain);
                }
                
            });
            return this;
        }

        // -------------------------------------//
        //       /\\    |\  ||  ||  |\   //     //
        //      // \\   ||\ ||  ||  ||\ //|     //
        //     //===\\  ||\\||  ||  ||\\/||     //
        //    //     \\ || \\|  ||  ||   ||     //
        // -------------------------------------//

        // METHODE : progressCircle

        eaConstructor.prototype.progressCircle = function(radiusC, strokeW, rotateA, percent, durationT) {

            this.each(function(svgT) {

                    let Pcircle = svgT.querySelector(".ea-p-circle");
                        let Bcircle = svgT.querySelector(".ea-b-circle");
                            let Ptext = svgT.querySelector(".ea-p-text");
                    
                    Pcircle.style.transitionProperty = "stroke-dashoffset";
                    Pcircle.setAttribute("r", radiusC);
                        Bcircle.setAttribute("r", radiusC);
            
                    let globalW = radiusC + strokeW;
            
                    svgT.style.width = globalW * 2 + "px";
                    svgT.style.height = globalW * 2 + "px";
            
                    Pcircle.setAttribute("cx", "50%");
                    Pcircle.setAttribute("cy", "50%");
                        Bcircle.setAttribute("cx", "50%");
                        Bcircle.setAttribute("cy", "50%");
            
                    Pcircle.style.strokeWidth = strokeW + "px";
                    Pcircle.style.fill = "none";
                        Bcircle.style.strokeWidth = (strokeW - 1) + "px";
                        Bcircle.style.fill = "none";

                    Pcircle.setAttribute("transform", "rotate(" + rotateA + ", " + globalW + "," + globalW + ")");
            
                if(Pcircle.getAttribute("data-percent") == percent){
                    // Do nothing
                }else{

                    let perimeter = parseInt(2 * Math.PI * radiusC);
            
                    Pcircle.style.strokeDasharray = perimeter;

            
                    let lineW = (perimeter * percent) / 100;
            
                    let negativeInc;
                    let positiveInc;
            
                    if(!Pcircle.hasAttribute("data-percent") || Pcircle.getAttribute("data-percent") == 0){
                        Pcircle.setAttribute("data-percent", percent);
                        Pcircle.style.strokeDashoffset = perimeter;
                        Ptext.textContent = "0%";
                    }else if(Pcircle.getAttribute("data-percent") > percent){
                        negativeInc = true;
                    }else if(Pcircle.getAttribute("data-percent") < percent){
                        positiveInc = true;
                    }
                    
                    Pcircle.style.display = "block";
                    Pcircle.style.transitionDuration = durationT + "s";
            
                    let incD;
                    let incN;
            
                    if(negativeInc === true){
                        incN = Pcircle.getAttribute("data-percent");
                        incD = (durationT / (Pcircle.getAttribute("data-percent") - percent)) * 1000;
                        Pcircle.setAttribute("data-percent", percent);
                    }else if(positiveInc === true){
                        incN = Pcircle.getAttribute("data-percent");
                        incD = (durationT / (percent - Pcircle.getAttribute("data-percent"))) * 1000;
                        Pcircle.setAttribute("data-percent", percent); 
                    }else{
                        incD = (durationT / percent) * 1000;
                        incN = 0;      
                    }
            
                    Ptext.setAttribute("dominant-baseline", "middle");
                    Ptext.setAttribute("text-anchor", "middle");
                    Ptext.setAttribute("x", "50%");
                    Ptext.setAttribute("y", "51%");
            
                    setTimeout(() => {
            
                        Ptext.style.display = "inline";
            
                        if(durationT === 0){
                            Ptext.textContent = percent + "%";
                        }else if(negativeInc === true){
                            let incP = setInterval(() => {
                                if(incN <= (percent + 1)){clearInterval(incP);}  
                                    incN--;
                                Ptext.textContent = incN + "%";
                            }, incD);
                        }else{
                            let incP = setInterval(() => {
                                if(incN >= (percent - 1)){clearInterval(incP);}  
                                    incN++;
                                Ptext.textContent = incN + "%";
                            }, incD);
                        }
            
                        Pcircle.style.strokeDashoffset = parseInt(perimeter - lineW);
            
                    }, 50);
                
                    }

            });
            return this;
        };

        // METHODE : deleteTextPart

        eaConstructor.prototype.deleteTextPart = function (mWidth, timeout, durationT, reverse) {

            this.each(function(item) {

                    if(reverse === false && item.style.maxWidth == "0px"){
                    }else{
                        item.style.transitionDuration = durationT + "s";
                        item.style.display = "inline-block";
                        // item.style.wordWrap = "nowrap";
                        item.style.whiteSpace = "nowrap";
                        if(window.getComputedStyle(item).maxWidth == "0px"){
                            item.style.maxWidth = mWidth;
                            setTimeout(() => {
                                item.style.color = item.getAttribute("data-color");
                            }, timeout);
                        }else{
                            item.style.maxWidth = mWidth;
                            if(item.style.color !== "transparent"){
                                item.setAttribute("data-color", window.getComputedStyle(item).color);
                                item.style.color = "transparent";
                            }
                            setTimeout(() => {
                                item.style.maxWidth = "0px";
                            }, timeout);
                        }
                    }

            });

            return this;

        };

        // METHODE : fadeElement

        eaConstructor.prototype.fadeElement = function (start, end, direction, durationT) {

            this.each(function(item) {

                    let opacityvar;
                    item.style.transitionDuration = "0s";
                    if(!window.getComputedStyle(item).filter || window.getComputedStyle(item).filter == "opacity(0)"){
                        item.style.filter = "opacity(0)";
                        opacityvar = "opacity(1)";
                    }else{
                        item.style.filter = "opacity(1)";
                        opacityvar = "opacity(0)";
                    }
                    item.style.position = "relative";
                    if(direction == "vt"){item.style.top = start;}
                    else if(direction == "hz"){item.style.left = start;}
                    setTimeout(() => {
                        item.style.transitionDuration = durationT + "s";
                        if(direction == "vt"){
                            item.style.top = end;
                            item.style.filter = opacityvar;
                        }else if(direction == "hz"){
                            item.style.left = end;
                            item.style.filter = opacityvar;
                        }
                    }, 50);

            });
            return this;
        };
    

    // --------------------------------------------------------
    // ESPACE DES METHODES   
    // --------------------------------------------------------

    
    // Instantiation du constructeur
	let instantiate = function (selector, numberQ) {
		return new eaConstructor(selector, numberQ);
	};

    // Retourne le constructeur instantié
	return instantiate;

})();

// ESPACE DES FONCTIONS SIMPLES

// SLEEP (event listener)

    // to use :
    // case 1 : sleep(e, delay, ()=>{modifyProperty = modified;});                   | Errors possible
    // case 2 : if(sleep(e, delay)==true){return false;}modifyProperty = modified;   | No errors

let sleepGestionnaire = [];

function sleep(event, duration, fnc){
        
    let name = event.type;
    let target = event.currentTarget.tagName;
    let targetclass = event.currentTarget.className;
    let regTarget = targetclass.replace(/[^0-9a-zA-Z]/g, '');
    let delay = duration;

    let toPush = name + "," + targetclass + "," + target + "," + delay;
    let regtoPush = toPush.replace(/[^0-9a-zA-Z]/g, '');
    
    if(sleepGestionnaire.indexOf(regtoPush) == -1){

        sleepGestionnaire.push(regtoPush);

        clearTimeout(this["st"+regTarget]);
    
        this["st"+regTarget] = setTimeout(function() {
            delete(sleepGestionnaire[sleepGestionnaire.indexOf(regtoPush)]);
        }, duration);

        // if fnc parameter -> exec the function
        if(fnc){fnc();}

    }else if(sleepGestionnaire.indexOf(regtoPush) !== -1){
        console.log("event stopped");
        return true;
    }

}

// ONCE FUNCTION 
    // usage : once( function(){ // do something } )}

function once(fn, context) { 
    var result;
    
     return function() { 
        if(fn) {
            result = fn.apply(context || this, arguments);
            fn = null;
        }
    
        return result;
    };
}
