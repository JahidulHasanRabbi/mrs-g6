/**
 * @typedef {Object} MenuItemConfig
 * @property {string} icon - Path to the icon image
 * @property {string} label - Display label for the menu item
 * @property {string} link - Navigation link
 */

/**
 * @typedef {Object} SectionConfig
 * @property {string} title - Section title
 * @property {string} icon - Section icon path
 * @property {MenuItemConfig[]} [items] - Optional menu items
 * @property {React.ReactNode} [children] - Custom content
 */

/**
 * @typedef {Object} HamburgerMenuProps
 * @property {boolean} isOpen - Whether the menu is open
 * @property {() => void} onClose - Callback when menu should close
 */

export {};
