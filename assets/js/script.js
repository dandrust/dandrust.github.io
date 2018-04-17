var menuButton = document.getElementById('mobile-menu-button')
var closeButton = document.getElementById('mobile-menu-close');
var menu = document.getElementById('header-link-container');

var showElement = function(element) {
  console.log(element);
  element.style.display = 'block';
}

var hideElement = function(element) {
  console.log(element);
  element.style.display = 'none';
}

menuButton.addEventListener('click', function() {
  hideElement(menuButton);
  showElement(menu);
  showElement(closeButton);
});

closeButton.addEventListener('click', function() {
  hideElement(closeButton);
  hideElement(menu);
  showElement(menuButton);
});
