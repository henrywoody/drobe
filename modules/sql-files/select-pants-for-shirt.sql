SELECT
	possible_pants.*
FROM
	(SELECT
		*
	FROM
		pants
	WHERE
		pants.user_id = $1 AND (pants.min_temp <= $2 OR pants.min_temp IS NULL) AND (pants.max_temp >= $2 OR pants.max_temp IS NULL)
	) AS possible_pants
INNER JOIN
	(SELECT
		pants_id
	FROM
		shirt_pants_join
	WHERE
		shirt_id = $3
	) AS joined_pants
ON
	possible_pants.id = joined_pants.pants_id