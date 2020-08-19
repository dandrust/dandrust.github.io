---
layout: post
title: Writing Raw SQL in Laravel
date: 2020-08-19
category: posts
tags: php laravel
---

I'm working on an application in the retail space which requires the system to fetch a set of UPCs that are associated with a user. To get from a user to a UPC we first need to look at the user's loyalty accounts with one or more retailers, then the retailers' relationship with one or more distributors, and finally query for UPCs (which are related to the _relationship_ between a distributor and retailer).

This involes traversing a number of foreign-key relationship in the data model:
* Starting with users...
* Look at loyalty accounts, which holds a reference to a user and retailer...
* Then look at a distributor-retailer join table...
* Finally, reference a join table between distributor-retailers and UPCs...
* ...and finally collect the applicable UPC records

That amount of complexity didn't seem to play nicely with Laravel's Eloquent ORM out of the box. Eloquent is more than sufficient for 80% of our query needs so extending the ORM didn't seem like the best move in this case. I'd write some raw SQL, but where?

I've been trying to keep some good architectural boundaries in this application by using services to hold single units of business logic and repositories to house persistence and retrieval code. A repository is exactly where this kind of thing should live, but I liked the idea of keeping the SQL even more separate.  

What I landed on was a SQL file and a query object to wrap it, all hidden behind a repository.

In the examples below, given a user id and a UPC, the system should return a distributor-retailer relationship.

First I wrote some SQL:
```sql
-- database/sql/UpcAttributionLookup.sql

SELECT
    dr.*
FROM
    users u
    JOIN loyalty_accounts la ON u.id = la.user_id
    JOIN distributor_retailer dr ON dr.retailer_id = la.retailer_id
    JOIN distributor_retailer_upc dru ON dr.id = drs.distributor_retailer_id
    JOIN upc u ON dru.upc_id = s.id
WHERE
    u.id = @user_id
    AND u.code = @upc
ORDER BY
    la.rank ASC
LIMIT 1
```

And then a plain old PHP object to wrap it. This will load the SQL file, replace the `@user_id` and `@upc` variables, and execute the query. Finally it will return the first row of data (represented as a standard object) or null:
```php
// app/Queries/UpcAttributionLookup.php

<?php

namespace App\Queries;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UpcAttributionLookup 
{
    const SQL_FILE_PATH = '/database/sql/UpcAttributionLookup.sql';
    const USER_ID_REPLACE = '@user_id';
    const UPC_REPLACE = '@upc';

    protected $rawSql;
    
    public function  __construct()
    {
        $this->rawSql = file_get_contents(base_path().self::SQL_FILE_PATH);
    }

    public function toSql($user_id, $upc) : string
    {
        $sql = $this->rawSql;
        $sql = Str::replaceFirst(self::USER_ID_REPLACE, $user_id, $sql);
        $sql = Str::replaceFirst(self::UPC_REPLACE, "'{$upc}'", $sql);
        return $sql;
    }

    public function get($user_id, $upc)
    {
        $result = DB::select($this->toSql($user_id, $upc));

        return empty($result) ? null : $result[0];
    }
}
```

Since this query is returning a row of data that's represented by the `DistributorRetailer` entity, the `DistributorRetailerRepository` hides it's implementation:
```php
// app/Repositories/DistributorRetailerRepository.php

<?php

namespace App\Repositories;

use App\DistributorRetailer;
use App\Entities\UserEntity;
use App\Queries\UpcAttributionLookup;

class DistributorRetailerRepository 
{
    //...

    public function findOneByUserAndUpc(UserEntity $user, string $upc) {
        $query = new UpcAttributionLookup;
        $result = $query->get($user->id, $upc);

        if ($result) {
            $attributes = (array)$result;
            $distributorRetailer = (new DistributorRetailer)->newFromBuilder($attributes);
            $result = $distributorRetailer;
        }

        return $result;
    }

    //...
}
```

Notice that if the result is not null I initialize a new `DistributorRetailer` model and call `newFromBuilder` with the data returned from the query. This is right from Eloquent's implementation -- `newFromBuilder` will initialize a new model instance from the results of Eloquent's query builder class.  This means that my query will return an Eloquent model just the same.

I'm happy with how organized this tunred out. Looking at the file structure it's relatively clear what's going on and I don't have raw SQL mixing about with my PHP application code.

```
+- app
|  +- Repositories 
|  |  +- DistributorRetailerRepository.php
|  |
|  +- Queries
|     +- UpcAttributionLookup.sql
|
+- database
   +- sql
      +- UpcAttributionLookup.sql
```




