SELECT
	valid_shirt.*
FROM
	(SELECT
		*
	FROM
		shirt
	WHERE
		shirt.user_id = $1 AND (shirt.min_temp <= $2 OR shirt.min_temp IS NULL) AND (shirt.max_temp >= $2 OR shirt.max_temp IS NULL)
	) AS valid_shirt
INNER JOIN
	(SELECT
		DISTINCT shirt_id
	FROM
		shirt_pants_join
	) AS joined_shirt
ON
	valid_shirt.id = joined_shirt.shirt_id;