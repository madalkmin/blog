-- Permite ao admin listar arquivos do bucket (necessário para limpar imagens ao excluir uma viagem)
drop policy if exists "media: admin lista" on storage.objects;
create policy "media: admin lista" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (select public.is_blog_admin()));
