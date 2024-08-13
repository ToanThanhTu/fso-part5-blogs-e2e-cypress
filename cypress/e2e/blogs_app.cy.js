describe('Blog app', function () {
  beforeEach(function () {
    // empty the database
    cy.request('POST', `${Cypress.env('BACKEND')}/testing/reset`)

    // create a new user
    const user = {
      name: 'John Smith',
      username: 'john',
      password: 'smith'
    }
    cy.request('POST', `${Cypress.env('BACKEND')}/users`, user)

    cy.visit('')
  })

  it('front page opened to log in form', function () {
    cy.contains('log in to application')
    cy.contains('username')
    cy.contains('password')
  })

  it('user can log in', function () {
    cy.get('#username').type('john')
    cy.get('#password').type('smith')
    cy.get('#login-button').click()

    cy.contains('John Smith logged in')
  })

  it('login fails with wrong password', function () {
    cy.get('#username').type('john')
    cy.get('#password').type('wrong')
    cy.get('#login-button').click()

    cy.contains('wrong username or password')
    cy.get('.error')
      .contains('wrong username or password')
      .should('contain', 'wrong username or password')
      .and('have.css', 'color', 'rgb(255, 0, 0)') // notification is displayed in red
      .and('have.css', 'border-style', 'solid')

    cy.get('html').should('not.contain', 'John Smith logged in')
    cy.contains('John Smith logged in').should('not.exist')
  })

  describe('when logged in', function () {
    beforeEach(function () {
      cy.login({ username: 'john', password: 'smith' })
    })

    it('a new blog can be created', function () {
      cy.contains('create new blog').click()
      cy.get('#title').type('a blog created by cypress')
      cy.get('#author').type('Jack Daniels')
      cy.get('#url').type('https://fakeurl.com')
      cy.get('.create-button').click()
      cy.contains('a blog created by cypress - Jack Daniels')
    })

    it('user can create a blog and delete that blog', function () {
      cy.contains('create new blog').click()
      cy.get('#title').type('a blog created by cypress')
      cy.get('#author').type('Jack Daniels')
      cy.get('#url').type('https://fakeurl.com')
      cy.get('.create-button').click()
      cy.contains('a blog created by cypress - Jack Daniels')

      cy.contains('view').click()
      cy.contains('remove').click()
      cy.contains('blog a blog created by cypress by Jack Daniels removed')
      cy.contains('a blog created by cypress - Jack Daniels').should('not.exist')
    })

    describe('and a blog exists', function () {
      beforeEach(function () {
        cy.createBlog({
          title: 'a blog created by cypress',
          author: 'Kang Liam',
          url: 'https://anotherfake.url'
        })
      })

      it('it can be liked', function () {
        cy.contains('view').click()
        cy.contains('like').click()
        cy.contains('like').click()

        cy.contains('likes 2')
      })
    })

    describe('and several blogs exist', function () {
      beforeEach(function () {
        // login with John Smith
        cy.login({ username: 'john', password: 'smith' })

        // create blogs with john user
        cy.createBlog({
          title: 'First Blog by Cypress',
          author: 'John Cy',
          url: 'https://fist.blog.john'
        })
        cy.createBlog({
          title: 'Second Blog by Cypress',
          author: 'Cy Smith',
          url: 'https://second.blog.john'
        })
        cy.createBlog({
          title: 'Third Blog by Cypress',
          author: 'Smith Press',
          url: 'https://third.blog.john'
        })
      })

      it('one of those can be liked', function () {
        // find and click view to expand the second blog
        cy.contains('Second Blog by Cypress')
          .contains('view')
          .click()

        // find the like button and save it with 'as'
        cy.contains('Second Blog by Cypress')
          .contains('like')
          .as('likeButton')

        // click like twice
        cy.get('@likeButton').click()
        cy.get('@likeButton').click()

        cy.contains('Second Blog by Cypress')
          .contains('likes 2')
      })

      it('other user cannot see remove button on john\'s blogs', function () {
        cy.contains('logout').click()

        // create and login with a new user
        const user = {
          name: 'Adam Ling',
          username: 'adam',
          password: 'ling'
        }
        cy.request('POST', `${Cypress.env('BACKEND')}/users`, user)

        cy.get('#username').type('adam')
        cy.get('#password').type('ling')
        cy.get('#login-button').click()

        cy.contains('view').click()
        cy.contains('remove').should('not.exist')
      })

      it.only('blogs are ordered by likes, most liked first', function () {
        // find and click view to expand the second blog
        cy.contains('Second Blog by Cypress')
          .contains('view')
          .click()

        // find the like button and save it with 'as'
        cy.contains('Second Blog by Cypress')
          .contains('like')
          .as('likeButton')

        // click like twice
        cy.get('@likeButton').click()
        cy.get('@likeButton').click()

        cy.contains('hide').click()

        // find and click view to expand the third blog
        cy.contains('Third Blog by Cypress')
          .contains('view')
          .click()

        // find the like button and save it with 'as'
        cy.contains('Third Blog by Cypress')
          .contains('like')
          .as('likeButton')

        // click like 3 times
        cy.get('@likeButton').click()
        cy.get('@likeButton').click()
        cy.get('@likeButton').click()

        cy.contains('hide').click()

        cy.get('.blog').eq(0).should('contain', 'Third Blog by Cypress')
        cy.get('.blog').eq(1).should('contain', 'Second Blog by Cypress')
        cy.get('.blog').eq(2).should('contain', 'First Blog by Cypress')
      })
    })
  })
})