/* eslint-disable arrow-parens */
/* eslint-disable prefer-destructuring */
/* eslint-disable padded-blocks */
/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable no-trailing-spaces */
/* eslint-disable consistent-return */
const { nanoid } = require('nanoid');

const books = require('./bookshelf');

const addBookHandler = async (req, h) => {
    try {
        const {
            name, year, author, summary, publisher, pageCount, readPage, reading,
        } = req.payload;
        // input validations
        if (name === undefined) {
            return h.response({
                status: 'fail',
                message: 'Gagal menambahkan buku. Mohon isi nama buku',
            }).code(400);
        }
        if (pageCount < readPage) {
            return h.response({
                status: 'fail',
                message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
            }).code(400);
        }

        // init book
        const id = nanoid(16);
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;
        const finished = (pageCount === readPage);
        const newBook = {
            id,
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            finished,
            reading,
            insertedAt,
            updatedAt
        };

        // push book to books array
        await books.push(newBook);

        // check if book was added successfully 
        const bookFilter = books.filter((book) => book.id === id);
        const isSuccess = bookFilter.length > 0;

        // response message according to success
        if (isSuccess) {
            return h.response({
                status: 'success',
                message: 'Buku berhasil ditambahkan',
                data: {
                    bookId: id,
                },
            }).code(201);
        }
        return h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku'
        }).code(500);
    } catch (err) {
        // handle error here
        console.log(err);
    }
};

const getAllBooksHandler = async (request, h) => {
    const { name, reading, finished } = request.query;

    let filteredBooks = books;

    if (name !== undefined) {
        filteredBooks = filteredBooks.filter((book) =>
            book.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (reading !== undefined) {
        filteredBooks = await filteredBooks.filter(async (book) =>
            (await book.reading) === !!Number(reading));
    }

    if (finished !== undefined) {
        filteredBooks = await filteredBooks.filter(async (book) =>
            (await book.finished) === !!Number(finished));
    }

    const response = h.response({
        status: 'success',
        data: {
            books: filteredBooks.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            })),
        },
    });
    response.code(200);

    return response;
};

const getBookByIdHandler = (request, h) => {
    const { id } = request.params;
    const book = books.filter((b) => b.id === id)[0];

    if (book !== undefined) {
        return {
            status: 'success',
            data: {
                book,
            },
        };
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
    });
    response.code(404);

    return response;
};

const editBookByIdHandler = async (req, h) => {
    try {
        const { id } = req.params;
        const {
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading
        } = req.payload;
        const updatedAt = new Date().toISOString();

        const arr = books.findIndex(book => book.id === id);
        if (arr === -1) {
            const response = h.response({
                status: 'fail',
                message: 'Gagal memperbarui buku. Id tidak ditemukan'
            });
            response.code(404);
            return response;
        }

        if (name === undefined) {
            const response = h.response({
                status: 'fail',
                message: 'Gagal memperbarui buku. Mohon isi nama buku',
            });
            response.code(400);
            return response;
        }

        if (pageCount < readPage) {
            const response = h.response({
                status: 'fail',
                message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
            });
            response.code(400);
            return response;
        }

        const finished = (pageCount === readPage);
        books[arr] = {
            ...books[arr],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            finished,
            reading,
            updatedAt
        };

        const response = h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui'
        });
        return response;

    } catch (error) {
        console.error(error);
    }
};

const deleteBookByIdHandler = async (request, h) => {
    const { id } = request.params;

    try {
        const arr = books.findIndex((book) => book.id === id);
        if (arr !== -1) {
            books.splice(arr, 1);
            return h.response({
                status: 'success',
                message: 'Buku berhasil dihapus',
            }).code(200);
        }

        return h.response({
            status: 'fail',
            message: 'Buku gagal dihapus. Id tidak ditemukan',
        }).code(404);
    } catch (error) {
        return h.response({
            status: 'fail',
            error,
        });
    }
};




module.exports = {
    addBookHandler,
    getBookByIdHandler,
    getAllBooksHandler,
    editBookByIdHandler,
    deleteBookByIdHandler
};
