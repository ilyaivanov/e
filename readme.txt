Global topics
 - Syntax highlight
 - Suggestions
 - Auto-import external functions and variables
 - Show compilation errors
 - Go to definitions
 - Prettier
 - Collapse parts of the code
 - View files and folders

Problems
 - I don't know how to parse html/css + other code like C, GLSL, C++ (god forbid)
 - Do I need Desktop App (Electron/Tauri) or I can fit this into a PWA
    - Main concert for this is file system access. For PWA you need permission each time you launch app

Typescript API responsibilities
 - Tokenizer
 - Show errors
 - Show suggestions (complete, import, etc)
 - Go to definition (getDefinitionAtPosition)

Prettier 
 - Just fucking format code (read config file in a project .prettier or use defaults)

Backlog
   - Autoscroll when going down or up (postponed)
   - Move typescript access to service worker for snappy UI
   - Try to preserve cursor position after formatting. VS Code is not doing a perfect job, but quite a good job at this
   - Add 'desired' column position, so that when you move vertically, your cursor stays on the same col if posible
   - Multiple cursors
   - Cache d.ts and js files (make it working as PWA offline using another service worker)
   - Support unit tests? Like wallaby.js but minimal would be super usefull

Vim 
 Vim Progress
   ✔ HJKL movement
   ✔ two modes: normal and insert. Switch between them via i and Esc
   ✔ w b justs words back and forth
   ✔ O and o to add new lines and switch to insert mode (yet buggy)


 Vim Backlog
   - rd and rl rs re to replace word, like, end of line, start of line
   - when jumping words consider punctuation, not just space and \n
   - Have you own console, canvas, dom inside IFrame, whatever
   - Format the code when exiting insert mode? 

Timeline
 Week 47
  21.11.2024
    - Show lines of text
    - Move around via HJKL
    - Two modes: normal and insert
    - Add/remove chars 
    - Jump words back and forth

  22.11.2024
   - Tokenize source code and show source code tokenized
   - Show errors for the code to the right
   - typescript module supports completion list
   - getDefinitionAtPosition

  23.11.2024
   ✔ Fix cursor navigation bug
   ✔ Cleanup lang service (find relation between lang service and program)
   ✔ Extract model updates on events, reduce draw time to 0.2-2ms (still can be reduced)
   ✔ Create a template file (with webpack build support) for service worker

  24.11.2024
   ✔ Integrate prettier for TS code. KeyS to format code
   ✔ KeyR to run code via simple eval function
   ✔ O and o to insert a new line above and below (buggy)
   ✔ d to remove current line

 
 Week 48
  Goals 
   - Complete integration with TS compiler, namely
     - Go to definition
     - Auto-suggestions
     - Go throught errors
     - Auto-import
   - Suport projects with multiple files. Sync code with fs

  25.11.2024 
   - Add ability to compile via ESNext
