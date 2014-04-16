$('#toggleButton').live('click',toggle);
function toggle(){
  $('#rightContent').fadeToggle("fast");
  $('#leftContent').fadeToggle("fast");
  console.log("toggled");

}