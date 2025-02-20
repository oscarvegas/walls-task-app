import { useEffect, useState } from "react";
import logo from './logo.svg';
import './App.css';
import _ from 'lodash';
import { connect } from "http2";

export const TasksCrud = () => 
{
    const [tasksList, setTasksList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNotif, setShowNotif] = useState(false);
    const [messageNotif, setMessageNotif] = useState('');
    const [modalActive, setModalActive] = useState(false);
    const [confirmModalActive, setConfirmModalActive] = useState(false);
    const [titleValue, setTitleValue] = useState('');
    const [contentValue, setContentValue] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [deleteTaskName, setDeleteTaskName] = useState('');
    const [deleteTaskId, setDeleteTaskId] = useState(null);
    const [errValidation, setErrValidation] = useState('');
    
    const getTasksList = async () => 
    {
        setIsLoading(true);
        try {
            const storedToken = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/tasks', {
                headers: { Authorization: `Bearer ${storedToken}` },
            });
            
            let responseData = await response.json();    
            setIsLoading(false);
            setTasksList(responseData);

        } catch (error) {
            //setMessage('Protected request failed');
            console.log('protected failed!!')
        }

        setIsLoading(false);
    };

    const TaskList = (props) => {
        //console.log('tasks', props.tasks);
        return (
            <table className="table is-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Content</th>
                        <th> -actions</th>
                    </tr>
                </thead>
                <tbody>
                {
                    props.tasks.map(task =>
                        <tr key={task.id}>
                            <td>{task.id}</td>
                            <td>{task.title}</td>
                            <td className="content is-small">{task.content}</td>
                            <td className="buttons">
                                <button className="button is-success" onClick={ e => updateFormTask(task)}>
                                    Edit
                                </button>
                                <button className="button is-danger" onClick={ e => deleteTask(task)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    )
                }
                </tbody>
            </table>
        )
    };

    const addTask = () => 
    {
        setEditingId(null);
        setTitleValue('');
        setContentValue('');
        setModalActive(true);
    };

    const closeModal = () => 
    {
        setEditingId(null);
        setTitleValue('');
        setContentValue('');
        setModalActive(false);
    };

    const closeConfirmModal = () => 
    {
        setConfirmModalActive(false);
    };

    const updateTitleValue = (event) => 
    {
        //console.log('title now', event.target.value);
        //this.setState({ value: event.target.value })
        setTitleValue(event.target.value);
    };

    const updateContentValue = (event) => 
    {
        //console.log('content now', event.target.value);
        //this.setState({ value: event.target.value })
        setContentValue(event.target.value);
    };

    const updateFormTask = (task) => 
    {
        //console.log('update task', task);
        setTitleValue(task.title);
        setContentValue(task.content);
        setEditingId(task.id);
        setModalActive(true);
    };

    const saveChanges = async () => 
    {
        if (titleValue == '') {
            setErrValidation('Title is mandatory.');
            return false;
        }

        setIsLoading(true);

        let saveUrl = 'http://localhost:3001/api/task',
            saveMethod = 'POST',
            messageSave = 'Task Added successfully!';
        
        if (editingId != null) {
            saveUrl = 'http://localhost:3001/api/task/' + editingId;
            saveMethod = 'PUT';
            messageSave = 'Task ID ' + editingId + ' Edited successfully!';
        } 

        const response = await fetch(saveUrl, 
            {
                method: saveMethod,
                headers: {
                    "Content-Type": "application/json"
                    
                },
                body: JSON.stringify({
                    title: titleValue,
                    content: contentValue 
                })
            }
        );

        let responseData = await response.status; 
        
        if (responseData == 200) {
            setMessageNotif(messageSave);
        } else {
            setMessageNotif('There was an error saving');
        }

        setTitleValue('');
        setContentValue('');
        setEditingId(null);

        closeModal();
        getTasksList();
        setIsLoading(false);
        
        setShowNotif(true);
        
        setTimeout(() => {
            setShowNotif(false);
        }, 3000);
    };

    const deleteTask = async (task) => 
    {
        setDeleteTaskName(task.title);
        setDeleteTaskId(task.id);
        setConfirmModalActive(true);
    };

    const confirmDeletion = async () =>
    {
        setIsLoading(true);

        const response = await fetch('http://localhost:3001/api/task/' + deleteTaskId, 
            {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        let responseData = await response.status;  
        
        closeConfirmModal();

        getTasksList();
        setShowNotif(true);
        setIsLoading(false);

        setMessageNotif('Task was deleted successfully!');
        
        setTimeout(() => {
            setShowNotif(false);
        },2000);
    };

    useEffect(() => {
        //fetch on load
        getTasksList();
    },[]);
    
    return (
        <>
            {
                showNotif && 
                    <div className="notification is-success" style={{position:'fixed', top: '2rem', right: '4rem'}}>
                        <button className="delete"></button>
                        <strong>Success!</strong>
                        <span>{ messageNotif }</span>.
                    </div>        
            }
            <div className="column is-4">
                <h3 className="title is-3 has-text-info">Tasks</h3>
            </div>
            
            <div className="column is-8">
                <button className="button is-link is-pulled-right" onClick={addTask}>
                    + Add
                </button>
            </div>
                
            <div className="column is-12">
                {
                    isLoading && (
                        <button className="button is-loading is-info is-centered">...</button>
                    )
                }
                {
                    tasksList.length > 0 && (
                        <TaskList tasks={tasksList} />
                    )
                }
            </div>
             
            {/* MODAL BULMA  */}
            
            <div className={`modal ${modalActive?'is-active':''}`}>
                <div className="modal-background"></div>
                <div className="modal-card">
                    <header className="modal-card-head">
                    <p className="modal-card-title">{ editingId?`Update task ID ${editingId}`:'Add new task'}</p>
                    <button className="delete" aria-label="close" onClick={ e => closeModal()}></button>
                    </header>
                    <section className="modal-card-body">
                        
                        {/* <input className="input" type="text" placeholder="Text input" /> */}
                        <div className="field is-horizontal">
                            <div className="field-label is-required">
                                <label className="label">Title *</label>
                            </div>
                            <div className="field-body">
                                <div className="field">
                                    <p className="control">
                                        <input 
                                            className="input is-required" 
                                            type="text" 
                                            placeholder="Type a mandatory title" 
                                            required={true} 
                                            onChange={updateTitleValue}
                                            //defaultValue={titleValue}
                                            value={titleValue}
                                        />
                                    </p>
                                    {
                                    errValidation && 
                                        <p className="help has-text-danger">
                                            <strong className="has-text-danger">Error: </strong>{ errValidation }
                                        </p>        
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="field is-horizontal">
                            <div className="field-label is-normal">
                                <label className="label">Content</label>
                            </div>
                            <div className="field-body">
                                <div className="field">
                                <p className="control">
                                <textarea
                                    className="textarea"
                                    placeholder="Content can explain the task."
                                    rows={3}
                                    onChange={updateContentValue}
                                    //defaultValue={contentValue}
                                    value={contentValue}
                                    ></textarea>
                                </p>
                                </div>
                            </div>
                        </div>
                    </section>
                    <footer className="modal-card-foot">
                    <div className="buttons">
                        <button className={`button is-success ${isLoading?'is-loading':''}`} onClick={ e => saveChanges()}>
                            { editingId?'Update':'Add'}
                        </button>
                        <button className="button">Cancel</button>
                    </div>
                    </footer>
                </div>
            </div>


            {/* MODAL CONFIRM BULMA  */}
            
            <div className={`modal ${confirmModalActive?'is-active':''}`}>
                <div className="modal-background"></div>
                <div className="modal-card">
                    <header className="modal-card-head">
                    <p className="modal-card-title">Confirm Delete Task ID: {deleteTaskId}</p>
                    <button className="delete" aria-label="close" onClick={ e => closeConfirmModal()}></button>
                    </header>
                    <section className="modal-card-body">
                        Are you sure you want to delete {deleteTaskName}?
                    </section>
                    <footer className="modal-card-foot">
                    <div className="buttons">
                        <button className={`button is-danger ${isLoading?'is-loading':''}`} onClick={ e => confirmDeletion()}>
                            DELETE
                        </button>
                        <button className="button" onClick={ e => closeConfirmModal()}>Cancel</button>
                    </div>
                    </footer>
                </div>
            </div>

            
        </>
    );
};
