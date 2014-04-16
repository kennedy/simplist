$(init);
var tododb = null;

 function init(){
  var listForm = document.getElementById('listForm');
  var itemForm = document.getElementById('taskForm');
  // var itemX = document.getElementById('item_delete');
  listForm.addEventListener("submit", listSubmitHandler, false);
  itemForm.addEventListener("submit", itemSubmitHandler, false);
  // itemX.addEventListener("click", deleteItemHandler, false);
  initDatabase();
  // if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
  // console.log("you are an ios device");  
  // }else{
  //   console.log("you are not an ios Device");
  // }

}

function initDatabase() {
  try {
    if (!window.openDatabase) {
      alert('Databases are not supported in this browser.');
    } else {
      var shortName = 'tododb';
      var version = '1.0';
      var displayName = 'Todo List Database';
      var maxSize = 5 * 1024 * 1024; //  bytes
      tododb = openDatabase(shortName, version, displayName, maxSize);
      createTables();
      getList();
      $(".item_delete").live("click",deleteItemHandler)

    }
  } catch(e) {

    if (e == 2) {
      // Version number mismatch.
      console.log("Invalid database version.");
    } else {
      console.log("Unknown error "+e+".");
    }
    return;
  }
}
function errorHandler(transaction,error){
  console.log("Error!!");
  console.log(error);
}
function nullDataHandler() {}
function createTables(){
  tododb.transaction(
    function (transaction) {
      transaction.executeSql("CREATE TABLE IF NOT EXISTS primary_list (list_id INTEGER NOT NULL PRIMARY KEY ASC AUTOINCREMENT,list_name VARCHAR(50) not null, geo_id integer DEFAULT NULL)", [], nullDataHandler, errorHandler);
      transaction.executeSql("CREATE TABLE IF NOT EXISTS secondary_list (item_id INTEGER NOT NULL PRIMARY KEY ASC AUTOINCREMENT, list_id INTEGER NOT NULL, item_entry VARCHAR(500) NOT NULL, fav INTEGER DEFAULT 0, complete INTEGER DEFAULT 0)", [], nullDataHandler, errorHandler);
      transaction.executeSql("CREATE TABLE IF NOT EXISTS geo_loc (geo_id INTEGER NOT NULL PRIMARY KEY ASC AUTOINCREMENT, geo_code VARCHAR(30) NOT NULL, search_entry VARCHAR(500) NOT NULL)", [], nullDataHandler, errorHandler);
    }
  );
  // prePopulate();
}


function listSubmitHandler(event) {

  var val = $("#listName").val();
  
  if (val != "") {
    try {
      newList(val);
      $("#listName").val("");
      $("#listName").blur();
    } catch (error) {
    }
  }
  event.preventDefault();
}


function itemSubmitHandler(event){
  var value = $("#newTask").val();

  if (value != ""){
    try {
      newItem(value);
      $("#newTask").val("");
    }
    catch (error) {}
  }
  event.preventDefault();
}

function deleteItemHandler(event){
    var itemLi = $(this).parent();
    console.log(itemLi);
    num = parseInt(itemLi.attr("id").replace("task-",""));
    itemLi.remove();
    console.log('num ' + num); 
    deleteItem(num);
}

function newList(name){
  tododb.transaction(
    function (transaction) {
     //Optional Starter Data when page is initialized
     transaction.executeSql('INSERT INTO primary_list(list_name) VALUES (?)',[name],function (transaction){
      transaction.executeSql('select last_insert_rowid()',[],function (transaction, result) {
              console.log("sucessful add");
              var newList = document.createElement('li');
              var newSpan = document.createElement('span');
              var newA = document.createElement('a');
              var text = document.createTextNode(name);
              var deletebtn = document.createElement('a');
              deletebtn.setAttribute('class','delete-btn');


              newList.setAttribute('id','list_id'+result.rows.item(0)['last_insert_rowid()']);
              newSpan.setAttribute('class','stitching');
              newA.setAttribute('class','listLink');
              newA.appendChild(text);
              newSpan.appendChild(newA);
              newSpan.appendChild(deletebtn);
              newList.appendChild(newSpan);
              $('#prim_list').prepend(newList);
              selectList(result.rows.item(0)['last_insert_rowid()']);
              fixLastList();

              $(newA).click(function(){
                var listLi = $(this).parent().parent();
                num = parseInt(listLi.attr("id").replace("list_id",""));
                console.log('function new list' + num);
                selectList(num);
                if((navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
                console.log("you are an ios device");  
                toggle();
                }
              });     
             
              $(deletebtn).click(function(){
              var listLi = $(this).parent().parent();
              num = parseInt(listLi.attr("id").replace("list_id",""));
              listLi.remove();
              console.log('num ' + num); 
              removeList(num);
              });
            }
       
    );

  }
);
});}

function fixLastList(){
  $('#prim_list').children().removeClass("last");
  $('#prim_list').children().last().addClass("last");
}
function selectList(index){
  $('#prim_list').children().removeClass("selected");
  $('#prim_list').find("#list_id"+index).addClass("selected");
  $(".mainForm").find("h1").text($(".selected").find("a").text()+ " ITEMS");
  getItemList(index);
}

function newItem(entry){
  tododb.transaction(
    function (transaction){
      transaction.executeSql('INSERT INTO secondary_list(list_id,item_entry) VALUES (?,?)',[$('.selected').attr("id").substring(7),entry],
        function (transaction){
            transaction.executeSql('select last_insert_rowid()',[],function (transaction, result) {
              console.log("sucessful add");
              $('#todoList').prepend('<li id="task-' + result.rows.item(0)['last_insert_rowid()'] + '">' + entry + '<a class="item_delete" href="#"></a></li>');
            },
            errorHandler
          );
        },
        errorHandler
      );
    },
    errorHandler
  );
}

function deleteItem(id){
  tododb.transaction(
    function (transaction){
      transaction.executeSql('DELETE FROM secondary_list WHERE item_id=?',[id]);
      fixLastList();
    }
  )
}

function removeList(id){
  tododb.transaction(
    function (transaction){
      transaction.executeSql('DELETE FROM primary_list WHERE list_id=?',[id]);
      transaction.executeSql('DELETE FROM secondary_list WHERE list_id=?',[id]);
      if($("#prim_list").children().length > 0){
        selectList($('#prim_list').children().first().attr("id").substring(7));
        fixLastList();
      }else{
        $('#todoList').children().remove();
      }
    }
  )
}
function getList(){
  tododb.transaction(
    function (transaction){
      transaction.executeSql("SELECT list_id,list_name FROM primary_list",[],function (transaction, result){
        var prim_list=document.getElementById('prim_list');
        for(var i = 0;i < result.rows.length;i++){
            var row = result.rows.item(i);

            var newList = document.createElement('li');
            var newSpan = document.createElement('span');
            var newA = document.createElement('a');
            var text = document.createTextNode(row.list_name);
            var deletebtn = document.createElement('a');
            deletebtn.setAttribute('class','delete-btn');

            newList.setAttribute('id','list_id'+row.list_id);

            newSpan.setAttribute('class','stitching');
            newA.setAttribute('class','listLink');

            newA.appendChild(text);
            newSpan.appendChild(newA);
            newSpan.appendChild(deletebtn);
            newList.appendChild(newSpan);
              $('#prim_list').prepend(newList);

              $(newA).click(function(){
                var listLi = $(this).parent().parent();
                num = parseInt(listLi.attr("id").replace("list_id",""));
                console.log('function get list' + num);
                selectList(num);
                if((navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
                console.log("you are an ios device");  
                toggle();
                }
                

              });       

            $(deletebtn).click(function(){
            var listLi = $(this).parent().parent();
            num = parseInt(listLi.attr("id").replace("list_id",""));
            listLi.remove();
            console.log('num ' + num); 
            removeList(num);
           });

          }
        if($("#prim_list").children().length > 0){
          selectList($('#prim_list').children().first().attr("id").substring(7));
          fixLastList();
        }
       })
     }
   )
 }

function getItemList(list_id) {
  tododb.transaction(
    function (transaction) {
      transaction.executeSql("SELECT * from secondary_list inner join primary_list on secondary_list.list_id == primary_list.list_id where secondary_list.list_id==?",
        [list_id],
        function (transaction, result) {
          $('#todoList').children().remove();
          for(var i = 0;i < result.rows.length;i++){
            var row = result.rows.item(i);
            $('#todoList').prepend('<li id="task-' + row.item_id + '">' + row.item_entry + '<a class="item_delete" href="#"></a></li>');
          }
        },
        errorHandler
      );
    }
  );
}


