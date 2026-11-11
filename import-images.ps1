$src = 'C:\Users\pierr\dev\azote\publics\images'
$dst = 'C:\Users\pierr\dev\azote\site\public\images'

$map = @{
  'Lifting_glass_cloche_from_dessert' = 'hero-cloche'
  'Dark_restaurant_dining_room' = 'salle-magenta'
  'Hands_plating_dish_with_tweezers' = 'mains-dressage'
  'Glass_of_red_wine_on' = 'verre-vin'
  'Green_sphere_on_ceramic_plate' = 'plat-sphere'
  'White_dessert_in_nitrogen_fog' = 'dessert-fumee'
  'Dark_cocktail_smoking_on_bar' = 'cocktail-noir'
  'Green_pearls_on_dark_slate' = 'caviar-macro'
  'Bar_counter_with_lab_flasks' = 'bar-comptoir'
  'Black_dish_with_sauce_stroke' = 'plat-plongee'
  'Chef_silhouette_in_dark_kitchen' = 'cuisine-silhouette'
  'Candle_burning_on_dark_table' = 'table-detail'
  'Black_door_with_magenta_sign' = 'porte-exterieur'
  'Nitrogen_vapor_rolling_over_surface' = 'azote-vapeur'
  'Lab_bench_ingredients_arrangemen' = 'ingredients-etale'
  'Molecular_gastronomy_dish_presen' = 'plat-extra'
}

Get-ChildItem $src -File | ForEach-Object {
  $file = $_
  $key = $map.Keys | Where-Object { $file.Name -like "$_*" } | Select-Object -First 1
  if ($key) {
    Copy-Item $file.FullName (Join-Path $dst ($map[$key] + '.jpg'))
  }
}
Get-ChildItem $dst -Filter *.jpg | Select-Object -ExpandProperty Name
