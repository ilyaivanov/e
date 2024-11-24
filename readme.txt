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

Typescript API responsibilities
 - Tokenizer
 - Show errors
 - Show suggestions (complete, import, etc)
 - Go to definition (getDefinitionAtPosition)



Timeline
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

Backlog
   - Autoscroll when going down or up (postponed)
   - Move typescript access to service worker for snappy UI
   - Try to preserve cursor position after formatting. VS Code is not doing a perfect job, but quite a good job at this
   - Add 'desired' column position, so that when you move vertically, your cursor stays on the same col if posible
   - Multiple cursors
   - Cache d.ts and js files (make it working as PWA offline using another service worker)


Vim 
 Vim Progress
   ✔ HJKL movement
   ✔ two modes: normal and insert. Switch between them via i and Esc
   ✔ w b justs words back and forth

 Vim Backlog
   - O and o to add new lines and switch to insert mode 
   - rd and rl rs re to replace word, like, end of line, start of line
   - when jumping words consider punctuation, not just space and \n
   - Have you own console, canvas, dom inside IFrame, whatever
   - Format the code when exiting insert mode? 