var body = document.querySelector('body');
body.addEventListener('onload', function() {
    alert('page loaded')
})
var msgs = document.querySelectorAll('.dismsg');

msgs.forEach(function(msg) {
    msg.addEventListener('click', function() {
        alert('item has been added to cart checkout in menu')
    })
})

