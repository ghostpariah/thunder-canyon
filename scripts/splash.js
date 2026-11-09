const fs = require("fs");
const path = require("path");

class Splash{
    constructor(version){
        this.version = version
        this.head = `<div id='open-content'>`
        this.greeting =
         `<div class='welcome'>Welcome!</div>`
         this.headline = 
         `<h1>What's New in version ${this.version}?</h1>`
        this.headlineContent = this.buildHeadlineContent();
         this.tail = `</div>`
         

         

    }

    buildHeadlineContent(){
        const changelogPath = path.resolve(__dirname, "../CHANGELOG.md");

        try {
            const changelog = fs.readFileSync(changelogPath, "utf8");
            const sections = changelog.split(/\n(?=### )/g)
                .map(section => section.trim())
                .filter(Boolean);

            const listItems = sections
                .map(section => {
                    const lines = section.split(/\r?\n/)
                        .map(line => line.trim())
                        .filter(Boolean);

                    const heading = lines[0].replace(/^#+\s*/, "");
                    const items = lines.slice(1)
                        .filter(line => line.startsWith("- "))
                        .map(line => line.replace(/^[-*]\s*/, ""));

                    if (!items.length) return "";

                    return `
                        <li>
                            <strong>${heading}</strong>
                            <ul>
                                ${items.map(item => `<li>${item}</li>`).join("")}
                            </ul>
                        </li>
                    `;
                })
                .filter(Boolean)
                .join("");

            if (listItems) {
                return `<div id='headlineContent'><ul>${listItems}</ul></div>`;
            }
        } catch (error) {
            console.error("Unable to read CHANGELOG.md for Splash", error);
        }

        return `<div id='headlineContent'>
        
        <ul>
            <li>New Design</li>
            <li>User Log In</li>            
            <li>Customer Contacts</li>
            <li>Reports
                <ul>
                    <li>User Activity</li>
                    <li>No Shows</li>
                    <li>EOD</li>
                    <li>Company Job History</li>
                </ul>
            </li>
            <li>Automatic Updates</li>
        </ul>
        </div>
            `;
    }
    setVersion(v){

           this.version = v;
    }
     getGreeting(){
        return this.head+
        this.greeting + 
        this.headline+
        this.headlineContent+
        this.tail
     }
     setGreeting(){
         
     }
}



