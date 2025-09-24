# Orange Format for Text - Must-Know Tips Styling

## Overview
This document explains the formatting convention used in the MBLEX study materials to create orange background sections for "Must-Know Tips" content.

## How It Works

### Content Structure
The system processes markdown content and automatically converts any paragraph starting with `**Must-Know Tips:**` into an orange highlighted section.

### Markdown Syntax
```markdown
**Must-Know Tips:** Your important tip content goes here. This entire paragraph will be displayed with an orange background and white text. You can include multiple sentences in the same paragraph.
```

### Processing Logic
1. The content manager (`js/content-manager.js`) scans for lines containing `**Must-Know Tips:**`
2. It replaces this marker with `<div class="pyramid-point"><h4>Must-Know Tips</h4><p>`
3. The paragraph processing logic handles closing the div properly
4. CSS class `.pyramid-point` provides the orange gradient background styling

### Visual Result
- **Header**: "Must-Know Tips" appears in white text
- **Background**: Orange gradient (`linear-gradient(135deg, #f39c12, #e67e22)`)
- **Text**: White color with padding and rounded corners
- **Styling**: Box shadow and proper spacing

## Implementation Guidelines

### For New Content Files
1. Write your regular content in standard markdown
2. When you want to add important tips, use this exact format:
   ```markdown
   **Must-Know Tips:** Your tip content here.
   ```
3. Leave blank lines before and after the Must-Know Tips paragraph
4. The next section header (`### Section Name`) will automatically start with white background

### Example Structure
```markdown
### Cardiovascular System

Regular content about the cardiovascular system goes here with normal formatting.

**Must-Know Tips:** Direct all gliding strokes toward the heart to support venous return. Avoid deep pressure over major arteries like the carotid to prevent reduced brain flow.

### Digestive System

Regular content about the digestive system continues with normal white background.

**Must-Know Tips:** Apply abdominal strokes in a clockwise circle to follow the large intestine's path, promoting peristalsis and relieving constipation.
```

### Important Notes
- Only use `**Must-Know Tips:**` exactly as shown (case sensitive)
- Each Must-Know Tips section should be a single paragraph
- Don't add extra formatting inside the tips paragraph
- Keep tips concise but comprehensive

## CSS Styling Details
The `.pyramid-point` class provides:
- Orange gradient background
- White text color
- 1rem padding on all sides
- 10px border radius
- Box shadow for depth
- Proper margins for spacing

## Usage Across Study Areas
This format is standardized across all MBLEX study areas:
- Anatomy & Physiology
- Kinesiology
- Pathology & Contraindications
- Soft Tissue Benefits
- Client Assessment
- Ethics & Boundaries
- Professional Practice

Simply follow the `**Must-Know Tips:**` format in any `.md` file in the `assets/content/reading/` directory to achieve consistent orange highlighting.