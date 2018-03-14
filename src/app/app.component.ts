import { Component, AfterViewInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
//import * as Rx from '@reactivex/rxjs';
import { element } from 'protractor';


interface IPerson { name: string; }
interface IToDoItem {
  id: number;
  description: string;
  assignedTo: string;
  done: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public people: Observable<IPerson[]>;
  public items: Observable<IToDoItem[]>;
  public apiClient: HttpClient;
  public username: string = "";
  public filterList: Observable<IToDoItem[]>;
  constructor(private httpClient: HttpClient) {
    this.apiClient = httpClient;
    this.people = this.getPeopleList();
    this.items = this.getItemList();
  }
  public mine: boolean = false;
  public undone: boolean = false;
  public showAddForm: boolean = false;
  public showEditForm: boolean = false;
  public itemDesc: string;
  public taskAssignment: string;
  public taskId: number;
  getPeopleList() {
    return this.apiClient.get<IPerson[]>('http://localhost:8080/api/people/');
  }
  getItemList() {
    return this.apiClient.get<IToDoItem[]>('http://localhost:8080/api/todos/');
  }
  /*ngAfterViewInit()
  {
    let counter = 0;
    const button = document.querySelector("updateButton");
    Rx.Observable.fromEvent(button,"click")
    .filter(() => counter <5);
    //.subscribe(() => console.log(`Clicked the button ${++counter}times ... `));
    /*for(let element of this.items)
    {

    }
};*/
  updateItems() {
    console.log(this.username + " " + this.mine + " " + this.undone);
    this.items = this.getItemList();
    if (this.mine && this.undone === false) {
      this.items = this.getItemList().map(todoItems => todoItems.filter(element => element.assignedTo === this.username));
    } else if (this.mine === false && this.undone) {
      this.items = this.getItemList().map(todoItems => todoItems.filter(element => element.done === false || element.done == null));
    } else if (this.mine && this.undone) {
      this.items = this.getItemList().map(todoItems => todoItems.filter(element => (element.done === false || element.done == null) && element.assignedTo === this.username));
    }
  }
  toggleDone(checked, id) {
    console.log(checked);
    if (!checked) {
      this.apiClient.patch('http://localhost:8080/api/todos/' + id, {
        'done': true,
      }).subscribe(
        (val) => {
          console.log('Patch successful', val);
        },
        response => {
          console.log('Patch error', response);
        },
      );

    } else if (checked) {
      this.apiClient.patch('http://localhost:8080/api/todos/' + id, {
        'done': false,
      }).subscribe(
        (val) => {
          console.log('Patch successful', val);
        },
        response => {
          console.log('Patch error', response);
        },
      );
    }
  }
  addTodoItem() {
    this.apiClient.post<IToDoItem>('http://localhost:8080/api/todos/', {
      'description': this.itemDesc,
      'assignedTo': this.taskAssignment,
    }).subscribe(
      (val) => {
        console.log('Post successful');
        this.refresh();
      });
    this.taskId = 0;
    this.taskAssignment = "";
    this.itemDesc = "";
  }
  refresh() {
    this.people = this.getPeopleList();
    this.items = this.getItemList();
    this.updateItems();
  }
  toggleNewUserForm() {
    this.showAddForm = !this.showAddForm;
    this.showEditForm = false;
  }
  toggleEditForm(id, desc, assignment) {
    this.showEditForm = !this.showEditForm;
    this.showAddForm = false;
    this.taskId = id;
    this.itemDesc = desc;
    this.taskAssignment = assignment;

  }
  editToDoItem() {
    if (this.taskAssignment === "") {
      this.taskAssignment = "Nobody";
    }
    this.apiClient.patch('http://localhost:8080/api/todos/' + this.taskId, {
      'description': this.itemDesc,
      'assignedTo': this.taskAssignment,
    }).subscribe(
      (val) => {
        console.log('Edit successful');
        this.refresh();
      });
    this.showEditForm = false;
    this.taskId = 0;
    this.taskAssignment = "";
    this.itemDesc = "";
  }
  deleteToDoItem(id) {
    this.apiClient.delete('http://localhost:8080/api/todos/' + id).subscribe((val) => {
      console.log('Delete succeeded', val);
      this.refresh();
    });
  }
};


