/**
 * Represents a node in the native view tree
 */
export interface ViewNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children: string[];
  parent: string | null;
}

/**
 * Registry for managing native view instances
 *
 * Maintains a map of all created native views and their relationships,
 * enabling efficient updates and tree traversal.
 */
export class ViewRegistry {
  private readonly views = new Map<string, ViewNode>();
  private viewIdCounter = 0;

  /**
   * Generate a unique view ID
   */
  generateViewId(): string {
    return `view_${++this.viewIdCounter}`;
  }

  /**
   * Register a new view node
   */
  register(node: ViewNode): void {
    this.views.set(node.id, node);
  }

  /**
   * Get a view node by ID
   */
  get(viewId: string): ViewNode | undefined {
    return this.views.get(viewId);
  }

  /**
   * Check if a view exists
   */
  has(viewId: string): boolean {
    return this.views.has(viewId);
  }

  /**
   * Unregister a view node
   */
  unregister(viewId: string): void {
    this.views.delete(viewId);
  }

  /**
   * Get all view IDs
   */
  getAllIds(): string[] {
    return Array.from(this.views.keys());
  }

  /**
   * Get children of a view
   */
  getChildren(viewId: string): ViewNode[] {
    const node = this.views.get(viewId);
    if (!node) {
      return [];
    }

    return node.children
      .map((id) => this.views.get(id))
      .filter((n): n is ViewNode => n !== undefined);
  }

  /**
   * Get parent of a view
   */
  getParent(viewId: string): ViewNode | null {
    const node = this.views.get(viewId);
    if (!node?.parent) {
      return null;
    }

    return this.views.get(node.parent) || null;
  }

  /**
   * Get all ancestors of a view
   */
  getAncestors(viewId: string): ViewNode[] {
    const ancestors: ViewNode[] = [];
    let current = this.getParent(viewId);

    while (current) {
      ancestors.push(current);
      current = this.getParent(current.id);
    }

    return ancestors;
  }

  /**
   * Get all descendants of a view
   */
  getDescendants(viewId: string): ViewNode[] {
    const descendants: ViewNode[] = [];
    const node = this.views.get(viewId);

    if (!node) {
      return descendants;
    }

    const traverse = (nodeId: string): void => {
      const n = this.views.get(nodeId);
      if (!n) return;

      for (const childId of n.children) {
        const child = this.views.get(childId);
        if (child) {
          descendants.push(child);
          traverse(childId);
        }
      }
    };

    traverse(viewId);
    return descendants;
  }

  /**
   * Find views by type
   */
  findByType(type: string): ViewNode[] {
    return Array.from(this.views.values()).filter((node) => node.type === type);
  }

  /**
   * Find views matching a predicate
   */
  findWhere(predicate: (node: ViewNode) => boolean): ViewNode[] {
    return Array.from(this.views.values()).filter(predicate);
  }

  /**
   * Update view props
   */
  updateProps(viewId: string, props: Record<string, unknown>): void {
    const node = this.views.get(viewId);
    if (node) {
      node.props = { ...node.props, ...props };
    }
  }

  /**
   * Clear all views
   */
  clear(): void {
    this.views.clear();
    this.viewIdCounter = 0;
  }

  /**
   * Get total view count
   */
  get size(): number {
    return this.views.size;
  }

  /**
   * Export view tree as JSON (for debugging)
   */
  toJSON(rootId?: string): object {
    const buildTree = (nodeId: string): object | null => {
      const node = this.views.get(nodeId);
      if (!node) return null;

      return {
        id: node.id,
        type: node.type,
        props: node.props,
        children: node.children.map(buildTree).filter(Boolean),
      };
    };

    if (rootId) {
      return buildTree(rootId) || {};
    }

    // Find root nodes (nodes without parents)
    const roots = Array.from(this.views.values()).filter((n) => !n.parent);
    return roots.map((r) => buildTree(r.id)).filter(Boolean);
  }
}
