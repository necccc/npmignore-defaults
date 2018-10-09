const fs = require('fs')
const NPMIGNORE = `${process.env.INIT_CWD}/.npmignore`

const writeFinish = (err) => {
	if (err) throw err
}

const excludeFromDefaults = (exclude) => {
	return (item) => {
		return !exclude.includes(item)
	}
}

const createList = (data, exclude) => {
	return data
		.filter(excludeFromDefaults(exclude))
		.reduce((str, item) => {
			str += `${item}\n`
			return str
		}, '')
}

const createContent = (exclude = []) => {
	const defaults = require('./defaults');
	const folderList = createList(defaults.folders, exclude);
	const fileList = createList(defaults.files, exclude);
	const content = `

# Folders
${folderList}

# Files
${fileList}
`

	return content
}

const keepIgnoreEntries = (entry) => {
	const notEmpty = entry.length > 0
	const notComment = entry.substr(0,1) !== '#'

	return notEmpty && notComment
}

const updateExisting = () => {
	fs.readFile(NPMIGNORE, (err, data) => {
		if (err) {
			throw err;
		}

		const existing = data.toString().split("\n").filter(keepIgnoreEntries);
		const content = createContent(existing);

		fs.appendFile(NPMIGNORE, content, writeFinish)
	})
}


const writeNew = () => {
	fs.writeFile(NPMIGNORE, createContent(), writeFinish)
}

const accessCheck = (err) => {
	if (err && err.code === 'ENOENT') {
		return writeNew();
	} else if (err) {
		throw err;
	}

	updateExisting()
}

fs.access(NPMIGNORE, fs.constants.F_OK | fs.constants.W_OK, accessCheck);