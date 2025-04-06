const renderList = async () => {
   const lists = document.getElementById("display");
   
   const data = await getData();
   
   data.map((item) => {
      const listItem = document.createElement("li");
      const remove = document.createElement("button");
      listItem.textContent = `${item.task}`;
      remove.textContent = `remove`;
      
      lists.appendChild(listItem);
      listItem.appendChild(remove);
      
      remove.addEventListener("click", async () => {
         await removeItem(item.id);
         listItem.remove();
      });
   });
}

const getData = async () => {
   try {
      const response = await fetch("http://127.0.0.1:3000/todo");
      const data = await response.json();
      return data;
   } catch (err) {
      console.error(err);
   }
};

const addList = async () => {
   const data = document.getElementById("list").value;
   try {
      await fetch("http://localhost:3000/todo", {
         method: "POST",
         headers: { "Content-type": "application/json" },
         body: JSON.stringify({ task: data }),
      });
      await renderList();
   } catch (err) {
      console.log("Server Erorr");
   }
   
   document.getElementById("list").value = "";
};

const removeItem = async (id) => {
   try {
      const response = await fetch(`http://127.0.0.1:3000/todo/${id}`, {
         method: "DELETE"
      });
      if (!response) throw new Error("Somting error");
      
      const data = await response.json();
      return data;
   } catch (err) {
      console.log(err);
   }
};

document.addEventListener("DOMContentLoaded", renderList());