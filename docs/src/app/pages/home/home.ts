import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ComponentPreview {
  name: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage {
  protected readonly components: ComponentPreview[] = [
    { name: 'View', path: 'view', icon: '📦' },
    { name: 'Text', path: 'text', icon: '📝' },
    { name: 'Image', path: 'image', icon: '🖼️' },
    { name: 'Button', path: 'button', icon: '🔘' },
    { name: 'TextInput', path: 'text-input', icon: '⌨️' },
    { name: 'ScrollView', path: 'scroll-view', icon: '📜' },
    { name: 'FlatList', path: 'flat-list', icon: '📋' },
    { name: 'Modal', path: 'modal', icon: '🪟' },
  ];
}
