$(document).ready(function(){
    $('.delete-task').on('click', function(e){
      $target = $(e.target);
      console.log( $target.attr('data-id'));
    });
});