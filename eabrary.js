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
        link.href = 'eabrary.css';  
  
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
    // ESPACE DES METHODES   
    // --------------------------------------------------------

        // EACH
	
        eaConstructor.prototype.each = function(callback) {
            if (!callback || typeof callback !== 'function') return;
            for (let i = 0; i < this.elems.length; i++) {
                callback(this.elems[i], i);
            }
            return this;
        };

        // DELAY

        eaConstructor.prototype.delay = function(duration) {
            const proxy = new Proxy(this, {
            get: (target, prop) => {
                const f = target[prop]
                return (...args) => {

                setTimeout(() => {
                    return f.apply(target, [...args]);
                }, duration)
        
                return this;
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

        eaConstructor.prototype.off = function (evt, fcn) {
            this.each(function(item) {
                if (document.removeEventListener) {
                    item.removeEventListener(evt, fcn);
                } else if (document.detachEvent)  {
                    item.detachEvent("on" + evt, fcn);
                } else {
                    item["on" + evt] = null;
                }
            });
            return this;
        }

        // INCLUDE
        eaConstructor.prototype.include = function (urlI){
            this.each(function(item){
            let xhr = new XMLHttpRequest();
          
            xhr.onreadystatechange = (e) => { 
              if (xhr.readyState == 4 && xhr.status == 200) {
                item.innerHTML = xhr.responseText;
              }
            }
          
            xhr.open("GET", urlI, true);
            xhr.setRequestHeader('Content-type', 'text/html');
            xhr.send();
            });
            
            return this;
        }
        
        // METHOD SYNTAX TYPE
        // eaConstructor.prototype.color = function(color) {
        //     this.each(function(item) {
                
        //     });
        //     return this;
        // };

        // TOUTES LES METHODES APRES CELLE-CI

        // METHODE : deleteTextPart

        eaConstructor.prototype.deleteTextPart = function (mWidth, timeout, reverse, interval) {
            let intervalT = 0; if(interval) {intervalT = interval;}
            this.each(function(item, index) {
                setTimeout(() => {
                    if(reverse === false && item.style.maxWidth == "0px"){
                    }else{
                        item.style.display = "inline-block";
                        // item.style.wordWrap = "nowrap";
                        item.style.whiteSpace = "nowrap";
                        if(item.style.maxWidth == "0px"){
                            item.style.maxWidth = mWidth;
                            setTimeout(() => {
                                item.style.color = item.getAttribute("data-color");
                            }, timeout);
                        }else{
                            item.style.maxWidth = mWidth;
                            if(item.style.color !== "transparent"){
                                item.setAttribute("data-color", item.style.color);
                                item.style.color = "transparent";
                            }
                            setTimeout(() => {
                                item.style.maxWidth = "0px";
                            }, timeout);
                        }
                    }
                }, index * intervalT);
            });

            return this;

        };

        // METHODE : fadeElement

        eaConstructor.prototype.fadeElement = function (start, end, direction, durationT, interval) {
            let intervalT = 0; if(interval) {intervalT = interval;}
            this.each(function(item, index) {
                setTimeout(() => {
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
                            item.style.transitionProperty = "top, filter";
                            item.style.top = end;
                            item.style.filter = opacityvar;
                        }else if(direction == "hz"){
                            item.style.transitionProperty = "left, filter";
                            item.style.left = end;
                            item.style.filter = opacityvar;
                        }
                    }, 50);
                }, index * intervalT);
            });
            return this;
        };

        // METHODE : progressCircle

        eaConstructor.prototype.progressCircle = function(radiusC, strokeW, rotateA, percent, durationT, interval) {
            let intervalT = 0; if(interval) {intervalT = interval;}
            this.each(function(svgT, index) {
                setTimeout(() => {

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

                    let perimeter = 2 * Math.PI * radiusC;
            
                    Pcircle.style.strokeDasharray = perimeter;
                    Pcircle.style.strokeDashoffset = perimeter;
            
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
            
                        Pcircle.style.strokeDashoffset = perimeter - lineW;
            
                    }, 50);
                
                    }
                }, index * intervalT);
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
    // case 1 : sleep(e, delay, ()=>{modifyProperty = modified;});                    | Errors possible
    // case 2 : if(sleep(e, delay)==false){return false;}modifyProperty = modified;   | No errors

let sleepGestionnaire = [];

function sleep(event, duration, fnc){
        
    let name = event.type;
    let target = event.currentTarget.nodeName;
    let delay = duration;

    let toPush = name + "," + target + "," + delay;

    if(sleepGestionnaire.indexOf(toPush) == -1){
    
        sleepGestionnaire.push(toPush);
        setTimeout(() => {
            sleepGestionnaire.splice(sleepGestionnaire.indexOf(toPush));
        }, duration);

        // if fnc parameter -> exec the function
        if(fnc){fnc();}

    }else if(sleepGestionnaire.indexOf(toPush) !== -1){
        return false;
    }

}