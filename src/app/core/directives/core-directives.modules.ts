import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { HideDirective } from './hide/hide.directive'
import { IntersectionObserverDirective } from './parallax/observe-element.directive';
//import { InsideViewportDirective } from './parallax/inside-viewport.directive';

@NgModule({
    declarations: [
        HideDirective,
        IntersectionObserverDirective,
        //InsideViewportDirective
    ],
    imports: [CommonModule],
    exports: [
      HideDirective,
      IntersectionObserverDirective,
      //InsideViewportDirective    
    ],
    providers: [],
})
export class CoreDirectivesModule {}