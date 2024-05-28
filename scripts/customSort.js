function customSort(input, arr) {
    console.log("input is -" + input + "-");
    console.log(arr);
    if (input == "" || input == undefined) {
        console.log("input is -" + input + "-");
        return arr.sort((a, b) => (a.customer_name > b.customer_name ? 1 : -1));
    }
    return arr.sort((a, b) => {
        // Compare customer_name properties
        const nameA = a.customer_name.toLowerCase();
        const nameB = b.customer_name.toLowerCase();

        // Check if input matches at the beginning of the string
        const aStartsWithInput = nameA.startsWith(input.toLowerCase());
        const bStartsWithInput = nameB.startsWith(input.toLowerCase());

        // If both start with input or both don't start with input, sort alphabetically
        if (aStartsWithInput === bStartsWithInput) {
            return nameA.localeCompare(nameB);
        }

        // If only one starts with input, it comes first
        return aStartsWithInput ? -1 : 1;
    });
}
