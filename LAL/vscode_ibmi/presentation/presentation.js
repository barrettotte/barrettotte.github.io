 


/* slideshow.js */

/* Slideshow controls and functionality */

this.addEventListener('keydown', e => {
  if([13,32,33,34,35,36,37,38,39,40].indexOf(e.keyCode) > -1){
    e.preventDefault();
  }

  if(e.keyCode === 35){
    lastSlide();
  } else if(e.keyCode === 36){
    firstSlide();
  } else if([33,37,38].indexOf(e.keyCode) > -1){
    prevSlide();
  } else if([13,32,34,39,40].indexOf(e.keyCode) > -1){
    nextSlide();
  } 
});

function slideCeil(val, floorTo){
  return Math.ceil(val / floorTo) * floorTo;
}

function nextSlide(){
  window.scrollTo(0, slideCeil((window.scrollY + window.innerHeight), window.innerHeight));
}

function prevSlide(){
  window.scrollTo(0, slideCeil((window.scrollY - window.innerHeight), window.innerHeight));
}

function lastSlide(){
  const y = document.getElementsByClassName('presentation')[0].children.length * window.innerHeight;
  window.scrollTo(0, slideCeil(y, window.innerHeight));
}

function firstSlide(){
  window.scrollTo(0, 0);
}


