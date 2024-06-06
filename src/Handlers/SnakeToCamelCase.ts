export function snakeCaseToCamelCase(snakeCaseStr: string, space?: boolean): string {
	const words = snakeCaseStr.split("_");
	const camelCaseStr: string[] = [];
	words.forEach((word) => {
		word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		camelCaseStr.push(word);
	});
	return camelCaseStr.join(space ? " " : "");
}


export function addSpaceBeforeUpperCasePascalCase(input: string): string {
	return input.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
}
