
// Header h1 span - animation "Eabrary"

ea('.header h1 span').delay(1400).deleteTextPart("80px", 200);

// Texte de présentation - animation

ea('.main-header h1').fadeElement("-20px", "0px", "vt", 1);
// ea('main section .demo').delay(1400).fadeElement("-20px", "0px", "vt", 1, 1000)

// Espace Demo

    // Demo 1 - progressCircle animation
    ea('.ea-progresscircle').progressCircle(72, 8, "-90", 75, 0);
    ea('.progresscircle-button').on('click', function(e){
        if(sleep(e, 1000)==false){return false;}
        ea('.ea-progresscircle').progressCircle(72, 8, "-90", Math.floor(Math.random() * 100), 1);});

    // Demo 2 - fadeTextDelete animation
    ea('.deletetextpart-button').on('click', function(e){
        if(sleep(e, 1200)==false){return false;}
        ea('.ea-dtp').deleteTextPart("40px", 200, true);});

    // Demo 3 - fadeElement animation
    ea('.fadeelement-button').on('click', function(e){
        if(sleep(e, 2400)==false){return false;}
        ea('.custom-fadeelement').fadeElement("0px", "-100px", "vt", 1).delay(1400).fadeElement("-100px", "0px", "vt", 1);
    });

document.querySelector('.main-header p').addEventListener("click", function(e){
    sleep(e, 3000, ()=>{console.log(e.type);});
});


