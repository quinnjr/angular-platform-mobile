import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

/**
 * SEO and AEO (Answer Engine Optimization) Service
 *
 * Manages dynamic meta tags, structured data, and SEO optimization
 * for better search engine and AI assistant visibility.
 */

export interface PageSeoConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  structuredData?: object;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  private readonly baseTitle = 'Angular Platform Mobile';
  private readonly baseUrl = 'https://angular-platform-mobile.dev';
  private readonly defaultImage = `${this.baseUrl}/og-image.png`;

  /**
   * Update page SEO configuration
   */
  updatePage(config: PageSeoConfig): void {
    // Title
    const fullTitle = config.title === this.baseTitle
      ? config.title
      : `${config.title} | ${this.baseTitle}`;
    this.title.setTitle(fullTitle);

    // Description
    this.updateMetaTag('description', config.description);
    this.updateMetaTag('og:description', config.description);
    this.updateMetaTag('twitter:description', config.description);

    // Title meta tags
    this.updateMetaTag('og:title', fullTitle);
    this.updateMetaTag('twitter:title', fullTitle);

    // Keywords
    if (config.keywords?.length) {
      this.updateMetaTag('keywords', config.keywords.join(', '));
    }

    // Canonical URL
    const canonicalUrl = config.canonicalUrl || this.baseUrl;
    this.updateCanonicalUrl(canonicalUrl);
    this.updateMetaTag('og:url', canonicalUrl);
    this.updateMetaTag('twitter:url', canonicalUrl);

    // Open Graph
    this.updateMetaTag('og:type', config.ogType || 'website');
    this.updateMetaTag('og:image', config.ogImage || this.defaultImage);

    // Twitter
    this.updateMetaTag('twitter:card', config.twitterCard || 'summary_large_image');
    this.updateMetaTag('twitter:image', config.ogImage || this.defaultImage);

    // Robots
    if (config.noIndex) {
      this.updateMetaTag('robots', 'noindex, nofollow');
    } else {
      this.updateMetaTag('robots', 'index, follow');
    }

    // Structured Data
    if (config.structuredData) {
      this.updateStructuredData('page-structured-data', config.structuredData);
    }
  }

  /**
   * Update meta tag by name or property
   */
  private updateMetaTag(nameOrProperty: string, content: string): void {
    // Try updating by name first
    const existingByName = this.meta.getTag(`name="${nameOrProperty}"`);
    if (existingByName) {
      this.meta.updateTag({ name: nameOrProperty, content });
      return;
    }

    // Try updating by property (for og: tags)
    const existingByProperty = this.meta.getTag(`property="${nameOrProperty}"`);
    if (existingByProperty) {
      this.meta.updateTag({ property: nameOrProperty, content });
      return;
    }

    // Add new tag
    if (nameOrProperty.startsWith('og:') || nameOrProperty.startsWith('fb:')) {
      this.meta.addTag({ property: nameOrProperty, content });
    } else {
      this.meta.addTag({ name: nameOrProperty, content });
    }
  }

  /**
   * Update canonical URL
   */
  private updateCanonicalUrl(url: string): void {
    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  /**
   * Update or add structured data (JSON-LD)
   */
  updateStructuredData(id: string, data: object): void {
    let script = this.document.getElementById(id) as HTMLScriptElement;

    if (!script) {
      script = this.document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(data);
  }

  /**
   * Add breadcrumb structured data
   */
  setBreadcrumbs(items: BreadcrumbItem[]): void {
    const breadcrumbList = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url
      }))
    };

    this.updateStructuredData('breadcrumb-data', breadcrumbList);
  }

  /**
   * Add FAQ structured data for AEO
   */
  setFaq(questions: Array<{ question: string; answer: string }>): void {
    const faqData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': questions.map(q => ({
        '@type': 'Question',
        'name': q.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': q.answer
        }
      }))
    };

    this.updateStructuredData('faq-data', faqData);
  }

  /**
   * Add HowTo structured data for tutorials
   */
  setHowTo(
    name: string,
    description: string,
    steps: Array<{ name: string; text: string }>
  ): void {
    const howToData = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': name,
      'description': description,
      'step': steps.map((step, index) => ({
        '@type': 'HowToStep',
        'position': index + 1,
        'name': step.name,
        'text': step.text
      }))
    };

    this.updateStructuredData('howto-data', howToData);
  }

  /**
   * Add code example structured data for developer docs
   */
  setCodeExample(
    name: string,
    description: string,
    programmingLanguage: string,
    codeText: string
  ): void {
    const codeData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      'name': name,
      'description': description,
      'programmingLanguage': {
        '@type': 'ComputerLanguage',
        'name': programmingLanguage
      },
      'text': codeText
    };

    this.updateStructuredData('code-example-data', codeData);
  }

  /**
   * Generate component documentation page SEO
   */
  setComponentPage(
    componentName: string,
    description: string,
    props: string[]
  ): void {
    this.updatePage({
      title: `${componentName} Component`,
      description: `${description} Learn how to use the ${componentName} component in Angular Platform Mobile with examples and API reference.`,
      keywords: [
        `angular ${componentName.toLowerCase()}`,
        `mobile ${componentName.toLowerCase()}`,
        `native ${componentName.toLowerCase()}`,
        'angular platform mobile',
        'mobile component',
      ],
      canonicalUrl: `${this.baseUrl}/components/${componentName.toLowerCase()}`,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': `${componentName} Component - Angular Platform Mobile`,
        'description': description,
        'about': {
          '@type': 'SoftwareSourceCode',
          'name': componentName,
          'programmingLanguage': 'TypeScript'
        }
      }
    });

    this.setBreadcrumbs([
      { name: 'Home', url: this.baseUrl },
      { name: 'Components', url: `${this.baseUrl}/components` },
      { name: componentName, url: `${this.baseUrl}/components/${componentName.toLowerCase()}` }
    ]);
  }

  /**
   * Generate service documentation page SEO
   */
  setServicePage(
    serviceName: string,
    description: string
  ): void {
    this.updatePage({
      title: `${serviceName} Service`,
      description: `${description} Complete API reference and usage examples for ${serviceName} in Angular Platform Mobile.`,
      keywords: [
        `angular ${serviceName.toLowerCase()} service`,
        `mobile ${serviceName.toLowerCase()}`,
        'angular platform mobile',
        'mobile service',
      ],
      canonicalUrl: `${this.baseUrl}/services/${serviceName.toLowerCase()}`,
    });

    this.setBreadcrumbs([
      { name: 'Home', url: this.baseUrl },
      { name: 'Services', url: `${this.baseUrl}/services` },
      { name: serviceName, url: `${this.baseUrl}/services/${serviceName.toLowerCase()}` }
    ]);
  }
}
