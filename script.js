const renderList = async () => {
   const lists = document.getElementById("display");
   const emptyState = document.getElementById("empty-state");

   lists.innerHTML = "";

   const data = await getData();

   if (data && data.length > 0) {
      emptyState.style.display = "none";

      data.forEach((item) => {
         const listItem = document.createElement("li");
         listItem.setAttribute("data-task-id", item.id);
         const taskText = document.createElement("span");
         const remove = document.createElement("button");

         taskText.textContent = item.task;
         taskText.className = "task-text";

         if (item.completed) {
            taskText.classList.add("completed");
            listItem.classList.add("completed-task");
         }

         remove.innerHTML = `<i class="fas fa-trash"></i> Remove`;

         listItem.appendChild(taskText);
         listItem.appendChild(remove);
         lists.appendChild(listItem);

         taskText.addEventListener("click", async () => {
            const newCompletedState = !taskText.classList.contains("completed");
            const success = await toggleTaskCompletion(
               item.id,
               newCompletedState
            );

            if (success) {
               taskText.classList.toggle("completed");
               listItem.classList.toggle("completed-task");
            }
         });

         remove.addEventListener("click", async () => {
            listItem.style.opacity = "0";
            listItem.style.transform = "translateX(30px)";

            setTimeout(async () => {
               await removeItem(item.id);
               listItem.remove();

               if (lists.children.length === 0) {
                  emptyState.style.display = "flex";
               }
            }, 300);
         });
      });
   } else {
      emptyState.style.display = "flex";
   }
};

const getData = async () => {
   try {
      const response = await fetch("http://127.0.0.1:3000/todo");
      const data = await response.json();
      return data;
   } catch (err) {
      console.error("Error fetching data:", err);
      return [];
   }
};

const addList = async () => {
   const input = document.getElementById("list");
   const data = input.value.trim();

   if (!data) {
      input.style.borderColor = "#e74c3c";
      input.classList.add("shake");
      setTimeout(() => {
         input.classList.remove("shake");
         input.style.borderColor = "";
      }, 600);
      return;
   }

   try {
      await fetch("http://localhost:3000/todo", {
         method: "POST",
         headers: { "Content-type": "application/json" },
         body: JSON.stringify({ task: data }),
      });

      input.style.borderColor = "#4CAF50";
      setTimeout(() => {
         input.style.borderColor = "";
      }, 1000);

      await renderList();
   } catch (err) {
      console.log("Server Error:", err);

      input.style.borderColor = "#e74c3c";
      setTimeout(() => {
         input.style.borderColor = "";
      }, 1000);
   }

   input.value = "";
};

const removeItem = async (id) => {
   try {
      const response = await fetch(`http://127.0.0.1:3000/todo/${id}`, {
         method: "DELETE",
      });
      if (!response.ok) throw new Error("Something went wrong");

      const data = await response.json();
      return data;
   } catch (err) {
      console.log("Error removing item:", err);
   }
};

const toggleTaskCompletion = async (id, completed) => {
   try {
      console.log(`Toggling task ${id} to ${completed}`);
      const response = await fetch(`http://127.0.0.1:3000/todo/${id}/toggle`, {
         method: "PATCH",
         headers: { "Content-type": "application/json" },
         body: JSON.stringify({ completed }),
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (!response.ok) {
         throw new Error(data.message || "Failed to update task status");
      }

      return data.success;
   } catch (err) {
      console.error("Error updating task status:", err);
      alert("Failed to update task. The server might need a restart.");
      return false;
   }
};

document.getElementById("list").addEventListener("keypress", (e) => {
   if (e.key === "Enter") {
      addList();
   }
});

document.addEventListener("DOMContentLoaded", () => {
   renderList();

   const style = document.createElement("style");
   style.textContent = `
      @keyframes shake {
         0%, 100% { transform: translateX(0); }
         10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
         20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
      .shake {
         animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
      }
   `;
   document.head.appendChild(style);
});
