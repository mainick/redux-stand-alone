// named constants
const ADD_TODO = "ADD_TODO";
const VIEW_MSG_ADDED_TODO = "VIEW_MSG_ADDED_TODO";
const HIDE_MSG_ADDED_TODO = "HIDE_MSG_ADDED_TODO";
const FOUND_WORD = "FOUND_WORD"

// action creators
function addTodo(payload) {
    return {
        type: ADD_TODO,
        payload
    }
}
function viewMsgAddedTodo() {
    return { type: VIEW_MSG_ADDED_TODO };
}
function hideMsgAddedTodo() {
    return { type: HIDE_MSG_ADDED_TODO };
}
function foundWord() {
    return { type: FOUND_WORD }
}

const initialState = {
    todos: [],
    msg_added_todo: false,
    alert_forbidden_word: false
}

// reducers
function rootReducer(state = initialState, action) {
    switch (action.type) {
        case ADD_TODO:
            //return {...state, todos: state.todos.concat(action.payload)};
            return Object.assign({}, state, {
                todos: state.todos.concat(action.payload.title),
                msg_added_todo: true
            });
        case VIEW_MSG_ADDED_TODO:
            return Object.assign({}, state, {
                msg_added_todo: true
            });
        case HIDE_MSG_ADDED_TODO:
            return Object.assign({}, state, {
                msg_added_todo: false
            });
        case FOUND_WORD:
            return Object.assign({}, state, {
                alert_forbidden_word: true
            })
        default:
            return state;
    }
}

// middleware
function loggerMiddleware(store) {
    return function (next) {
        return function (action) {
            console.log(action)
            return next(action);
        }
    }
}
const wordsNotAllowed = ["spam", "subito", "urgente"];
function moderatorMiddleware(store) {
    return function (next) {
        return function (action) {
            if ( action.type === ADD_TODO ) {
                const todo = action.payload.title
                const checkWord = wordsNotAllowed.filter(word => todo.includes(word));
                if (checkWord.length) {
                    return store.dispatch(foundWord())
                }
            }
            return next(action);
        }
    }
}

const store = Redux.createStore(rootReducer, Redux.applyMiddleware(loggerMiddleware, moderatorMiddleware));

// UI
const input_title = document.getElementById('todo-title')
const form = document.forms[0];

form.addEventListener('submit', function (event) {
    event.preventDefault();

    store.dispatch(hideMsgAddedTodo())
    const data = new FormData(this);
    const payload = data.get('todo-title');
    store.dispatch(addTodo({ title: payload } ));
    input_title.value = ''
});

store.subscribe(function () {
    let count_current = document.getElementById('list-todos').childElementCount;
    let todoList = document.getElementById('list-todos');
    if( store.getState().todos.length > count_current ){
        let li = document.createElement('li');

        let todo = store.getState().todos[count_current]
        li.innerHTML = `<strong>${todo}</strong>`
        todoList.appendChild(li);
    }

    if ( store.getState().msg_added_todo === true ) {
        const h3 = document.createElement('h3');
        h3.style.color = 'green'
        document.body.appendChild(h3);
        h3.innerText = "Attività aggiunta alla lista.";
    }
    if ( store.getState().msg_added_todo === false ) {
        const h3 = document.getElementsByTagName('h3')[0]
        if (h3) {
            h3.remove();
        }
    }
    if ( store.getState().alert_forbidden_word === true ) {
        const h3 = document.createElement('h3');
        h3.style.color = 'red'
        document.body.appendChild(h3);
        h3.innerText = "Hai provato ad inserire una parola vietata.";
    }
})