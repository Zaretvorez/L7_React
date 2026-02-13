import React, { useMemo, useState } from "react";
import initialTasks from "./data/tasks.json";

const STATUS = {
  ACTIVE: "Активная задача",
  DONE: "Задача выполнена",
  CANCELED: "Задача отменена",
};

const STATUS_OPTIONS = [STATUS.ACTIVE, STATUS.DONE, STATUS.CANCELED];

const FILTERS = {
  ALL: "all",
  ACTIVE: "active",
  COMPLETED: "completed",
};

function formatDateRu(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ru-RU");
}

function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    description: "",
    status: STATUS.ACTIVE,
    deadline: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const [editing, setEditing] = useState({
    taskId: null,
    field: null,
    value: "",
  });

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === FILTERS.ACTIVE) {
        return task.status === STATUS.ACTIVE;
      }
      if (filter === FILTERS.COMPLETED) {
        return (
          task.status === STATUS.DONE || task.status === STATUS.CANCELED
        );
      }
      return true;
    });
  }, [tasks, filter]);

  function openModal() {
    setFormValues({
      description: "",
      status: STATUS.ACTIVE,
      deadline: "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validateForm(values) {
    const errors = {};
    if (!values.description.trim()) {
      errors.description = "Укажите описание задачи";
    }
    if (!values.status) {
      errors.status = "Выберите статус задачи";
    }
    if (!values.deadline) {
      errors.deadline = "Укажите дедлайн";
    }
    return errors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const errors = validateForm(formValues);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const newTask = {
      id: Date.now(),
      description: formValues.description.trim(),
      status: formValues.status,
      deadline: formValues.deadline,
    };

    setTasks((prev) => [...prev, newTask]);
    setIsModalOpen(false);
  }

  function handleDelete(taskId) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  function startEditing(taskId, field, currentValue) {
    setEditing({
      taskId,
      field,
      value: currentValue,
    });
  }

  function handleEditingChange(event) {
    setEditing((prev) => ({
      ...prev,
      value: event.target.value,
    }));
  }

  function finishEditing() {
    if (!editing.taskId || !editing.field) {
      setEditing({ taskId: null, field: null, value: "" });
      return;
    }

    const trimmed =
      editing.field === "description"
        ? editing.value.trim()
        : editing.value;

    if (!trimmed) {
      alert("Пустое значение сохранить нельзя");
      setEditing({ taskId: null, field: null, value: "" });
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === editing.taskId
          ? { ...task, [editing.field]: trimmed }
          : task
      )
    );

    setEditing({ taskId: null, field: null, value: "" });
  }

  function handleEditingKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      finishEditing();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setEditing({ taskId: null, field: null, value: "" });
    }
  }

  return (
    <div className="page">
      <div className="tabs">
        <button
          type="button"
          className={
            filter === FILTERS.ALL ? "tab-button active" : "tab-button"
          }
          onClick={() => setFilter(FILTERS.ALL)}
        >
          Все задачи
        </button>
        <button
          type="button"
          className={
            filter === FILTERS.ACTIVE ? "tab-button active" : "tab-button"
          }
          onClick={() => setFilter(FILTERS.ACTIVE)}
        >
          Активные задачи
        </button>
        <button
          type="button"
          className={
            filter === FILTERS.COMPLETED
              ? "tab-button active"
              : "tab-button"
          }
          onClick={() => setFilter(FILTERS.COMPLETED)}
        >
          Выполненные задачи
        </button>
      </div>

      <div className="table-wrapper">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Описание</th>
              <th>Статус</th>
              <th>Дедлайн</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visibleTasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-cell">
                  Задач нет
                </td>
              </tr>
            ) : (
              visibleTasks.map((task) => (
                <tr key={task.id}>
                  <td
                    className="cell clickable"
                    onClick={() =>
                      startEditing(task.id, "description", task.description)
                    }
                  >
                    {editing.taskId === task.id &&
                    editing.field === "description" ? (
                      <input
                        className="cell-input"
                        autoFocus
                        value={editing.value}
                        onChange={handleEditingChange}
                        onBlur={finishEditing}
                        onKeyDown={handleEditingKeyDown}
                      />
                    ) : (
                      task.description
                    )}
                  </td>
                  <td
                    className="cell clickable"
                    onClick={() =>
                      startEditing(task.id, "status", task.status)
                    }
                  >
                    {editing.taskId === task.id &&
                    editing.field === "status" ? (
                      <select
                        className="cell-select"
                        autoFocus
                        value={editing.value}
                        onChange={handleEditingChange}
                        onBlur={finishEditing}
                        onKeyDown={handleEditingKeyDown}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={
                          task.status === STATUS.ACTIVE
                            ? "status-pill status-active"
                            : task.status === STATUS.DONE
                            ? "status-pill status-done"
                            : "status-pill status-canceled"
                        }
                      >
                        {task.status}
                      </span>
                    )}
                  </td>
                  <td
                    className="cell clickable"
                    onClick={() =>
                      startEditing(task.id, "deadline", task.deadline)
                    }
                  >
                    {editing.taskId === task.id &&
                    editing.field === "deadline" ? (
                      <input
                        type="date"
                        className="cell-input"
                        autoFocus
                        value={editing.value}
                        onChange={handleEditingChange}
                        onBlur={finishEditing}
                        onKeyDown={handleEditingKeyDown}
                      />
                    ) : (
                      <span
                        className={
                          "deadline-text" +
                          (new Date(task.deadline) < new Date()
                            ? " deadline-overdue"
                            : "")
                        }
                      >
                        {formatDateRu(task.deadline)}
                      </span>
                    )}
                  </td>
                  <td className="cell cell-delete">
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDelete(task.id)}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="add-button-wrapper">
        <button
          type="button"
          className="primary-button"
          onClick={openModal}
        >
          Добавить задачу
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Добавить новую задачу</h2>
              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label className="form-label">
                  Описание
                  <input
                    name="description"
                    className={
                      "form-input" +
                      (formErrors.description ? " has-error" : "")
                    }
                    placeholder="Введите описание"
                    value={formValues.description}
                    onChange={handleFormChange}
                  />
                </label>
                {formErrors.description && (
                  <div className="error-text">
                    {formErrors.description}
                  </div>
                )}
              </div>

              <div className="form-row">
                <label className="form-label">
                  Статус
                  <select
                    name="status"
                    className={
                      "form-select" +
                      (formErrors.status ? " has-error" : "")
                    }
                    value={formValues.status}
                    onChange={handleFormChange}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                {formErrors.status && (
                  <div className="error-text">
                    {formErrors.status}
                  </div>
                )}
              </div>

              <div className="form-row">
                <label className="form-label">
                  Дедлайн
                  <input
                    type="date"
                    name="deadline"
                    className={
                      "form-input" +
                      (formErrors.deadline ? " has-error" : "")
                    }
                    placeholder="Укажите дедлайн"
                    value={formValues.deadline}
                    onChange={handleFormChange}
                  />
                </label>
                {formErrors.deadline && (
                  <div className="error-text">
                    {formErrors.deadline}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-button">
                  Добавить задачу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

