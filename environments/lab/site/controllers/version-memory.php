<?php 

return function ($page) { 
    $page->version()->memory()->set('myField', 'My Custom Value');
};