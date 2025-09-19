const fs = require('fs');
const path = require('path');

// Number of days to add to each date
const DAYS_TO_ADD = 15;

// Function to add days to a YYMMDD date string
function addDaysToYYMMDD(dateStr, daysToAdd) {
    if (dateStr.indexOf("9999")>-1) {
        console.log("placeholder:"+dateStr);
        return dateStr; //ignore placeholders
    }
    
    // Parse YYMMDD format
    const year = parseInt('20' + dateStr.substring(0, 2));
    const month = parseInt(dateStr.substring(2, 4)) - 1; // Month is 0-indexed in Date
    const day = parseInt(dateStr.substring(4, 6));
    
    // Create date object
    const date = new Date(year, month, day);
    
    // Add days
    date.setDate(date.getDate() + daysToAdd);
    
    
    // Format back to YYMMDD
    const newYear = date.getFullYear().toString().substring(2);
    const newMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    const newDay = date.getDate().toString().padStart(2, '0');
    const newString = newYear + newMonth + newDay;

    console.log("D:"+dateStr+" -> ", newString);
    return newString;
}

// Main function
function updateDates() {
    const filePath = path.join(__dirname, 'challenges.json');
    
    try {
        // Read the file
        let fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Use regex to find and replace all date properties
        // This regex looks for "date": "YYMMDD" pattern
        const dateRegex = /"date":\s*"(\d{6})"/g;
        
        let updateCount = 0;
        
        // Use replace with callback function to handle all matches reliably
        const updatedContent = fileContent.replace(dateRegex, (match, dateStr) => {
            const newDate = addDaysToYYMMDD(dateStr, DAYS_TO_ADD);
            updateCount++;
            return `"date": "${newDate}"`;
        });
        
        // Write the updated content back to the file
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        
        console.log(`\nSuccessfully updated ${updateCount} dates in challenges.json`);
        console.log(`Added ${DAYS_TO_ADD} days to each date.`);
        
    } catch (error) {
        console.error('Error updating dates:', error.message);
        process.exit(1);
    }
}

// Run the script
updateDates();