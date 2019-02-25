import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  @ViewChild('cform') commentFormDirective;
  commentForm: FormGroup;
  comment: Comment;
  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required': 'Author name is required.',
      'minlength': 'Author name must be at least 2 characters long.'
    },
    'comment': {
      'required': 'Comment is required.'
    }
  };

  constructor(private dishService: DishService,
              private location: Location,
              private route: ActivatedRoute,
              private fb: FormBuilder,
              @Inject('BaseURL') private BaseURL) {
                this.createForm();
               }

  ngOnInit() {
   this.dishService.getDishIds()
   .subscribe((dishIds) => this.dishIds = dishIds);
   this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe((dish) => { this.dish = dish; this.setPrevNext(dish.id); });
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)] ],
      comment: ['', Validators.required ],
      rating: 5
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();  // reset the form validation
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);  /* Gets the index of the array */
    // tslint:disable-next-line:max-line-length
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];  /* modulus allows to get the last item if index is 0 */
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) {
      return;
    }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        // check if any field is valid or dirty
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    const d = new Date;
    this.commentForm.value.date = d.toISOString();
    this.dish.comments.push(this.commentForm.value);
    this.commentFormDirective.resetForm();
    this.commentForm.reset({
      'author': '',
      'rating': 5,
      'comment': ''
    });
  }
}
