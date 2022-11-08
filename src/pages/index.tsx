import { format } from 'date-fns';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  formattedPostsPagination: PostPagination;
}

export default function Home({ formattedPostsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState(formattedPostsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(formattedPostsPagination.results);

  async function handleNextPage() {
    if (nextPage === null) return;

    const postsResults = await fetch(nextPage);
    const response = await postsResults.json();
    setNextPage(response.next_page);

    const newPosts = response.results.map(post => {
      return {
        ...post,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
      };
    });

    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={commonStyles.container}>
        <Header />

        <div className={styles.posts}>
          {posts.map(post => (
            <Link
              className={styles.post}
              href={`/post/${post.uid}`}
              key={post.uid}
            >
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <ul>
                <li>
                  <FiCalendar />
                  {post.first_publication_date}
                </li>
                <li>
                  <FiUser />
                  {post.data.author}
                </li>
              </ul>
            </Link>
          ))}

          {nextPage ? (
            <button type="button" onClick={handleNextPage}>
              Carregar mais posts
            </button>
          ) : null}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 5,
    orderings: {
      field: 'last_publication_date',
      direction: 'desc',
    },
  });

  const formattedPosts = postsResponse.results.map(post => ({
    ...post,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
  }));

  const formattedPostsPagination = {
    next_page: postsResponse.next_page,
    results: formattedPosts,
  };

  return {
    props: {
      formattedPostsPagination,
    },
  };
};
