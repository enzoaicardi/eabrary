
// Header h1 span - animation "Eabrary"
ea('.header h1 span').cssbezier('ease').delay(1400).deleteTextPart("80px", 200, 1);

// Texte de présentation - animation
ea('.main-header h1').fadeElement("-20px", "0px", "vt", 1);

// ea('main section .demo').interval(1000).delay(3000);

// Espace Demo

    // Demo 1 - progressCircle animation
    ea('.ea-default-progresscircle').progressCircle(72, 8, "-90", 75, 0);
    ea('.progresscircle-button').on('click', function(){
        if(sleep(1, 1000)==true){return false;}
        ea('.ea-default-progresscircle').cssbezier('ease').progressCircle(72, 8, "-90", Math.floor(Math.random() * 100), 1);});

    // Demo 2 - fadeTextDelete animation
    ea('.deletetextpart-button').on('click', function(e){
        if(sleep(2, 1400)==true){return false;}
        ea('.ea-dtp').deleteTextPart("40px", 200, 1, true);
    });    

    // Demo 3 - fadeElement animation
    ea('.fadeelement-button').on('click', function(){
        if(sleep(3, 2400)==true){return false;}
        ea('.custom-fadeelement').fadeElement("0px", "140px", "vt", 1).delay(1400).fadeElement("140px", "-100px", "vt", 0).fadeElement("-100px", "0px", "vt", 1);
    });


