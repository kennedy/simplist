 $(function(){ 
    
      var i = 0;
      
      // Initial loading of tasks
      for( i = 0; i < localStorage.length; i++)
        $("#todoList").prepend("<li id='task-"+ i +"'>" + localStorage.getItem('task-'+i) + " <a href='#'></a></li>");
        
      // Add a new task
      $("#taskForm").submit(function() {
        if (  $("#newTask").val() != "" ) {
          localStorage.setItem( "task-"+i, $("#newTask").val() );
          $("#todoList").prepend("<li id='task-"+i+"'>"+localStorage.getItem("task-"+i)+" <a href='#'></a></li>");
          $("#newTask").val("");
          i++;
        }
        return false;
		
      });

      // Remove a task      
      $("#todoList li a").live("click", function() {
        localStorage.removeItem($(this).parent().attr("id"));
        $(this).parent().remove();
      });
    });

 